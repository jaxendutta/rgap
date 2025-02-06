import pandas as pd
import mysql.connector

# fill your information below
db_config = {
    "host": "127.0.0.1",  # local host
    "user": "root",       
    "password": "FILLMEIN",  # enter your password here
    "database": "rgap"       # make sure u already have a database called rgap and already executed the CREATE TABLE queries from schema.sql
}

print("Start importing...")

# connect to mysql
conn = mysql.connector.connect(**db_config)
cursor = conn.cursor()

# read csv file
csv_file = "tri_agency_grants_2019.csv"  # may need to modify file path
df = pd.read_csv(csv_file, usecols=[
    "ref_number", "amendment_number", "amendment_date", "agreement_type",
    "recipient_legal_name", "research_organization_name", "recipient_country", 
    "recipient_province", "recipient_city", "recipient_postal_code",
    "federal_riding_name_en", "federal_riding_name_fr", "federal_riding_number",
    "prog_name_en", "prog_name_fr", "prog_purpose_en", "prog_purpose_fr",
    "agreement_title_en", "agreement_title_fr", "agreement_number",
    "agreement_value", "foreign_currency_type", "foreign_currency_value",
    "agreement_start_date", "agreement_end_date", "description_en", "description_fr",
    "expected_results_en", "expected_results_fr", "owner_org", "owner_org_title", "org"
], dtype=str, low_memory=False)  # convert all columns to string type
df.fillna("", inplace=True)  # replace all NaN with NULL to pass SQL checks



# to insert foreign key
recipient_map = {}
program_map = {}
organization_map = {}


# INSERT to table Recipient
for _, row in df.iterrows():
    recipient_key = (row["recipient_legal_name"], row["research_organization_name"], row["recipient_country"], row["recipient_city"])
    
    if recipient_key not in recipient_map:
        cursor.execute("""
            INSERT IGNORE INTO Recipient 
            (legal_name, research_organization_name, country, province, city, postal_code, 
             riding_name_en, riding_name_fr, riding_number)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            row["recipient_legal_name"], row["research_organization_name"],
            row["recipient_country"], row["recipient_province"], row["recipient_city"],
            row["recipient_postal_code"], row["federal_riding_name_en"], 
            row["federal_riding_name_fr"], row["federal_riding_number"]
        ))
        
        cursor.execute("""
            SELECT recipient_id FROM Recipient
            WHERE legal_name = %s AND research_organization_name = %s
                  AND country = %s AND city = %s
        """, recipient_key)
        recipient_id = cursor.fetchone()
        if recipient_id:
            recipient_map[recipient_key] = recipient_id[0]

# insert to table Program
for _, row in df.iterrows():
    prog_id = row["prog_name_en"]  # 假设 Program 表的主键是 `prog_id`

    if prog_id not in program_map:
        cursor.execute("""
            INSERT IGNORE INTO Program 
            (prog_id, name_en, name_fr, purpose_en, purpose_fr)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            prog_id, row["prog_name_en"], row["prog_name_fr"], 
            row["prog_purpose_en"], row["prog_purpose_fr"]
        ))

        cursor.execute("SELECT prog_id FROM Program WHERE prog_id = %s", (prog_id,))
        program_id = cursor.fetchone()
        if program_id:
            program_map[prog_id] = program_id[0]

# insert to table Organization
for _, row in df.iterrows():
    owner_org = row["owner_org"]

    if owner_org not in organization_map:
        cursor.execute("""
            INSERT IGNORE INTO Organization 
            (owner_org, org_title, abbreviation)
            VALUES (%s, %s, %s)
        """, (
            owner_org, row["owner_org_title"], row["org"]
        ))

        cursor.execute("SELECT owner_org FROM Organization WHERE owner_org = %s", (owner_org,))
        org_id = cursor.fetchone()
        if org_id:
            organization_map[owner_org] = org_id[0]

# insert to table ResearchGrant
for _, row in df.iterrows():
    recipient_key = (row["recipient_legal_name"], row["research_organization_name"], row["recipient_country"], row["recipient_city"])
    recipient_id = recipient_map.get(recipient_key, None)
    program_id = program_map.get(row["prog_name_en"], None)
    owner_org = organization_map.get(row["owner_org"], None)

    agreement_value = float(row["agreement_value"]) if row["agreement_value"] else None

    cursor.execute("""
        INSERT IGNORE INTO ResearchGrant 
        (ref_number, amendment_number, amendment_date, agreement_type, 
         agreement_number, agreement_value, foreign_currency_type, foreign_currency_value, 
         agreement_start_date, agreement_end_date, agreement_title_en, agreement_title_fr, 
         description_en, description_fr, expected_results_en, expected_results_fr, 
         owner_org, recipient_id, prog_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        row["ref_number"], row["amendment_number"], row["amendment_date"],
        row["agreement_type"], row["agreement_number"], agreement_value,
        row["foreign_currency_type"], row["foreign_currency_value"],
        row["agreement_start_date"], row["agreement_end_date"],
        row["agreement_title_en"], row["agreement_title_fr"],
        row["description_en"], row["description_fr"],
        row["expected_results_en"], row["expected_results_fr"],
        owner_org, recipient_id, program_id  # ✅ 这里添加外键
    ))

# close connection
conn.commit()
cursor.close()
conn.close()

print("import finished!")
