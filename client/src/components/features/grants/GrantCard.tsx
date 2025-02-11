import { ResearchGrant } from '@/types/models';
import { Card } from '@/components/common/ui/Card';
import { formatCurrency, formatDate } from '@/utils/format';
import { Link } from 'react-router-dom';
import { BookmarkPlus, University, FileText } from 'lucide-react';

interface GrantCardProps {
  grant: ResearchGrant;
  onBookmark?: () => void;
}

export const GrantCard = ({ grant, onBookmark }: GrantCardProps) => (
  <Card isHoverable className="p-4 relative">
    {onBookmark && (
      <button
        onClick={onBookmark}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
      >
        <BookmarkPlus className="h-5 w-5" />
      </button>
    )}

    <div className="pr-8">
      <div className="flex justify-between">
        <div className="space-y-1">
          <Link
            to={`/recipients/${grant.recipient_id}`}
            className="text-lg font-medium hover:text-blue-600 transition-colors"
          >
            {grant.legal_name}
          </Link>
          <Link
            to={`/institutes/${grant.research_organization_name}`}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <University className="h-4 w-4 mr-1.5" />
            {grant.research_organization_name}
          </Link>
          <p className="text-gray-600 flex items-center">
            <FileText className="h-4 w-4 mr-1.5" />
            {grant.agreement_title_en}
          </p>
          <p className="text-sm text-gray-500">
            Ref: {grant.ref_number}
          </p>
        </div>
        <div className="text-right">
          <p className="font-medium text-lg">
            {formatCurrency(grant.agreement_value)}
          </p>
          <p className="text-gray-600">{grant.org}</p>
          <p className="text-sm text-gray-500">
            {grant.city}, {grant.province}
          </p>
          <p className="text-sm text-gray-500">
            {formatDate(grant.agreement_start_date)} - {formatDate(grant.agreement_end_date)}
          </p>
        </div>
      </div>
    </div>
  </Card>
);