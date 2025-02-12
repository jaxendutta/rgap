import { ResearchGrant } from '@/types/models';
import { Card } from '@/components/common/ui/Card';
import { formatCurrency, formatDate } from '@/utils/format';
import { Link } from 'react-router-dom';
import { BookmarkPlus, University, FileText, Database } from 'lucide-react';

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
        <div className="space-y-1 max-w-[63%]">
          <Link
            to={`/recipients/${grant.recipient_id}`}
            className="text-lg font-medium hover:text-blue-600 transition-colors"
          >
            {grant.legal_name}
          </Link>
          <Link
            to={`/institutes/${grant.research_organization_name}`}
            className="flex items-start text-gray-600 hover:text-blue-600 transition-colors"
          >
            <University className="flex-shrink-0 h-4 w-4 mt-1 mr-1.5" />
            {grant.research_organization_name}
          </Link>
          <p className="text-gray-600 flex items-start">
            <FileText className="flex-shrink-0 h-4 w-4 mt-1 mr-1.5" />
            {grant.agreement_title_en}
          </p>
          <p className="text-sm text-gray-500 flex items-start">
            <Database className="flex-shrink-0 h-3 w-3 mt-1 ml-0.5 mr-2" />
            {grant.ref_number}
          </p>
        </div>
        <div className="text-right max-w-[30%]">
          <p className="font-medium text-lg">
            {formatCurrency(grant.agreement_value)}
          </p>
          <p className="text-gray-600">{grant.org}</p>
          <p className="text-sm text-gray-500">
            {grant.city.charAt(0).toUpperCase() + grant.city.slice(1).toLowerCase()}, {grant.province}
          </p>
          <p className="text-sm text-gray-500">
            <div className="flex items-end justify-end space-x-2">
              <span>{formatDate(grant.agreement_start_date)}</span>
              <span className="hidden lg:flex w-0.5 h-5 bg-gray-300 inline-block"></span>
              <span className="hidden lg:flex">{formatDate(grant.agreement_end_date)}</span>
            </div>
          </p>
        </div>
      </div>
    </div>
  </Card>
);