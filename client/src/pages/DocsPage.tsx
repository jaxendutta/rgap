import { useState } from 'react'
import { BookOpen, Search, Filter, LineChart, Database, ArrowRight } from 'lucide-react'

const sections = [
  {
    title: 'Getting Started',
    icon: BookOpen,
    content: [
      {
        type: 'paragraph',
        text: 'RGAP (Research Grant Analytics Platform) provides comprehensive access to research funding data from Canada\'s three major funding agencies: NSERC, CIHR, and SSHRC. This guide will help you make the most of the platform\'s features.'
      }
    ]
  },
  {
    title: 'Searching Grants',
    icon: Search,
    content: [
      {
        type: 'title',
        text: 'Quick Search'
      },
      {
        type: 'list',
        items: [
          'Use the search bar in the header to quickly find grants',
          'Search by recipient name, institution, or grant title',
          'Results update in real-time as you type'
        ]
      },
      {
        type: 'title',
        text: 'Advanced Search'
      },
      {
        type: 'list',
        items: [
          'Access advanced search from the sidebar or search page',
          'Filter by date ranges, funding amounts, and locations',
          'Combine multiple search criteria',
          'Save complex searches for later use'
        ]
      }
    ]
  },
  {
    title: 'Using Filters',
    icon: Filter,
    content: [
      {
        type: 'grid',
        items: [
          {
            title: 'Date Filters',
            description: 'Filter grants by start date, end date, or specific years'
          },
          {
            title: 'Amount Filters',
            description: 'Search by funding amount ranges or specific thresholds'
          },
          {
            title: 'Location Filters',
            description: 'Filter by country, province, city, or institution'
          },
          {
            title: 'Agency Filters',
            description: 'Filter by funding agency (NSERC, CIHR, SSHRC)'
          }
        ]
      }
    ]
  },
  {
    title: 'Analytics & Visualization',
    icon: LineChart,
    content: [
      {
        type: 'title',
        text: 'Available Visualizations'
      },
      {
        type: 'grid',
        items: [
          {
            title: 'Funding Trends',
            description: 'Track funding patterns over time with interactive charts'
          },
          {
            title: 'Geographic Analysis',
            description: 'Visualize funding distribution across regions'
          },
          {
            title: 'Institution Comparisons',
            description: 'Compare funding across different institutions'
          },
          {
            title: 'Funding Agency Analysis',
            description: 'Analyze funding distribution by agency'
          }
        ]
      }
    ]
  },
  {
    title: 'Data Coverage',
    icon: Database,
    content: [
      {
        type: 'stats',
        items: [
          {
            label: 'NSERC Grants',
            value: '90,378',
            trend: 'up'
          },
          {
            label: 'CIHR Grants',
            value: '35,340',
            trend: 'up'
          },
          {
            label: 'SSHRC Grants',
            value: '44,398',
            trend: 'up'
          },
          {
            label: 'Total Dataset',
            value: '170,116',
            trend: 'up'
          }
        ]
      },
      {
        type: 'paragraph',
        text: 'Our database is regularly updated with new grants and amendments from official sources.'
      }
    ]
  }
]

function ContentRenderer({ content }: { content: any[] }) {
  return (
    <div className="space-y-8">
      {content.map((item, index) => {
        switch (item.type) {
          case 'paragraph':
            return (
              <p key={index} className="text-gray-600 leading-7">
                {item.text}
              </p>
            )
          
          case 'title':
            return (
              <h3 key={index} className="text-lg font-medium text-gray-900 mt-8 first:mt-0">
                {item.text}
              </h3>
            )
          
          case 'list':
            return (
              <ul key={index} className="space-y-1 text-gray-600">
                {item.items.map((listItem: string, i: number) => (
                  <li key={i} className="flex items-start">
                    <ArrowRight className="h-5 w-5 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                    {listItem}
                  </li>
                ))}
              </ul>
            )
          
          case 'grid':
            return (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {item.items.map((gridItem: any, i: number) => (
                  <div key={i} className="p-4 rounded-lg border bg-white border-gray-200 hover:border-gray-300 transition-colors">
                    <h4 className="font-medium text-gray-900">{gridItem.title}</h4>
                    <p className="mt-1 text-sm text-gray-600">{gridItem.description}</p>
                  </div>
                ))}
              </div>
            )
          
          case 'stats':
            return (
              <div key={index} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {item.items.map((stat: any, i: number) => (
                  <div key={i} className="p-4 rounded-lg bg-white border border-gray-200">
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                ))}
              </div>
            )
          
          default:
            return null
        }
      })}
    </div>
  )
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('Getting Started')

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
      <div className="h-full flex">
        {/* Sidebar Navigation */}
        <div className="w-64 border-r bg-white overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Documentation</h2>
            <nav className="space-y-1">
              {sections.map(({ title, icon: Icon }) => (
                <button
                  key={title}
                  onClick={() => setActiveSection(title)}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-md w-full
                    ${activeSection === title
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                  <span className="truncate">{title}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto py-8 px-8">
            {sections.map(({ title, content, icon: Icon }) => (
              <div
                key={title}
                className={activeSection === title ? 'block' : 'hidden'}
              >
                <div className="flex items-center mb-6">
                  <Icon className="h-6 w-6 mr-3 text-gray-900" />
                  <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                </div>
                <ContentRenderer content={content} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}