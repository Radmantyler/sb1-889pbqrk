export interface Regulation {
  id: string;
  chapter: string;
  subchapter: string;
  title: string;
  content: string;
}

export interface AssessmentSection {
  id: string;
  title: string;
  content: string;
  relatedRegulations: string[];
  status: 'compliant' | 'non-compliant' | 'needs-review';
  comments: string;
}

export interface Assessment {
  id: string;
  title: string;
  createdAt: Date;
  lastModified: Date;
  sections: AssessmentSection[];
  status: 'draft' | 'under-review' | 'approved';
}