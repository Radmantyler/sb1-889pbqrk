# Project Structure and Requirements Prompt

## Project Overview
This is a React-based regulatory compliance analysis application built with TypeScript, Vite, and Tailwind CSS. The application helps analyze documents for compliance with Texas Administrative Code Chapter 336 regulations.

## Technical Stack
- **Frontend Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Database**: Supabase
- **File Processing**: 
  - PDF.js for PDF processing
  - Mammoth for DOCX processing
  - Native text file handling
- **PDF Generation**: jsPDF with html2canvas
- **AI Integration**: OpenAI API
- **Payment Processing**: Stripe

## Project Structure
```
/
├── src/
│   ├── components/
│   │   ├── ComparisonView.tsx    # Side-by-side comparison of documents
│   │   ├── Features.tsx          # Feature showcase component
│   │   ├── Header.tsx            # Application header with navigation
│   │   ├── Hero.tsx             # Landing page hero section
│   │   └── PaymentModal.tsx     # Stripe payment integration
│   ├── pages/
│   │   ├── HomePage.tsx         # Landing page
│   │   ├── UploadPage.tsx       # Document upload and analysis
│   │   ├── ReportAnalysis.tsx   # Analysis results display
│   │   └── RegulationsManager.tsx # Regulation management
│   ├── services/
│   │   ├── openai.ts            # OpenAI API integration
│   │   ├── stripe.ts            # Stripe payment processing
│   │   └── supabase.ts          # Supabase database integration
│   ├── types/
│   │   ├── index.ts             # Common TypeScript interfaces
│   │   └── supabase.ts          # Supabase type definitions
│   └── utils/
│       ├── fileUtils.ts         # File processing utilities
│       └── pdfUtils.ts          # PDF generation and processing
└── supabase/
    └── migrations/              # Database migrations
```

## Key Features
1. **Document Analysis**
   - Upload and process PDF, DOCX, and TXT files
   - AI-powered analysis using OpenAI
   - Compliance checking against Texas regulations

2. **Report Generation**
   - Detailed compliance reports
   - PDF export functionality
   - Share and download options

3. **Regulations Management**
   - Store and manage regulatory requirements
   - Version control for regulations
   - Active/inactive status tracking

4. **Payment Integration**
   - Single report purchase option
   - Subscription-based access
   - Secure payment processing with Stripe

## Database Schema
```sql
Table: regulations
- id: uuid (Primary Key)
- title: text
- chapter: text
- content: text
- version: text
- effective_date: date
- created_at: timestamptz
- updated_at: timestamptz
- is_active: boolean
```

## Authentication
- Email/password authentication through Supabase
- Row Level Security (RLS) policies for data access
- Public read access for active regulations
- Authenticated access for regulation management

## Environment Variables Required
```
VITE_OPENAI_API_KEY=
VITE_STRIPE_PUBLIC_KEY=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Design Guidelines
1. **UI Components**
   - Clean, professional interface
   - Responsive design
   - Consistent spacing and typography
   - Lucide icons for visual elements

2. **Color Scheme**
   - Primary: Green (#10B981)
   - Secondary: Blue (#3B82F6)
   - Background: White (#FFFFFF)
   - Text: Dark Gray (#111827)

3. **Typography**
   - Primary Font: Times New Roman for reports
   - System fonts for UI elements
   - Clear hierarchy in headings

## Report Structure
1. Document details (metadata)
2. Executive summary
3. Regulatory framework analysis
4. Document review
5. Technical assessment
6. Findings and recommendations
7. Conclusion

## Error Handling
- Comprehensive error handling for API calls
- User-friendly error messages
- Fallback UI states
- Network error recovery

## Performance Considerations
- Lazy loading for routes
- Optimized PDF processing
- Efficient database queries
- Proper caching strategies

## Security Requirements
- Secure file handling
- API key protection
- Data encryption
- XSS prevention
- CSRF protection
- Input validation

## Testing Requirements
- Unit tests for utilities
- Integration tests for API calls
- E2E tests for critical paths
- Accessibility testing