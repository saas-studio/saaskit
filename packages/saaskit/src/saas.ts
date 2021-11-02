import { Story } from './story'
import { Noun } from './semantics'
import { Logo, Color, Font } from './marketing'
import { LandingPage, Website } from '.';

export interface SaaS extends Product {
    callToAction?: {
        [key: string]: { 
          [key: string]: any, 
          annualPrice?: number, 
          monthlyPrice?: number,
          annualUserPrice?: number, 
          monthlyUserPrice?: number,
        },
    },
    theme?: {
      primaryColor?: string | Color,
      secondaryColor?: string | Color,
      accentColor?: string | Color,
      backgroundColor?: string | Color,
      font?: string | Font,
      logo?: string | Logo,
      darkMode?: boolean,
    },
    nouns?: {
      [key: string]: Noun
    },
    verbs?: {
      [key: string]: any
    },
    creates?: {
      [key: string]: Create
    }
    triggers?: {
      [key: string]: Trigger
    }
    searches?: {
      [key: string]: Search
    }
    actions?: {
      [key: string]: Action
    }
    website?: Website | LandingPage
    experiments?: [] | SaaS[] | Experiment[],
    integrations?: [] | Integration[],
    plugins?: [] | Plugin[]
  }

  export interface Product extends Story {
    category?: Category | Category[]
    callToAction?: {
        [key: string]: { 
          [key: string]: any, 
          price?: number, 
        },
    },
  }

  export interface API extends SaaS {
    name?: string
  }
  
  export interface Experiment {
    weight?: number
    variant?: SaaS
  }

  export interface Integration {
  
  }
  
  export interface Plugin {
  
  }
  
  export type Create = {
    name?: string;
  };

  export type Trigger = {
    name?: string;
  };
  
  export type Search = {
    name?: string;
  };
  
  export type Action = {
    name?: string;
  };
  
  export type Alternative = {
    name?: string;
    url?: string;
    description?: string;
    pros?: string[];
    cons?: string[];
  };
  


  enum Category {
    Accounting = 'Accounting',
    AdsConversion = 'Ads & Conversion',
    Analytics = 'Analytics',
    AppBuilder = 'App Builder',
    AppFamilies = 'App Families',
    BookmarkManagers = 'Bookmark Managers',
    BusinessIntelligence = 'Business Intelligence',
    Calendar = 'Calendar',
    CallTracking = 'Call Tracking',
    CMS = 'Website Builders',
    Commerce = 'Commerce',
    Communication = 'Communication',
    ContactManagement = 'Contact Management',
    ContentFiles = 'Content & Files',
    CRM = 'CRM (Customer Relationship Management)',
    CustomerAppreciation = 'Customer Appreciation',
    CustomerSupport = 'Customer Support',
    Dashboards = 'Dashboards',
    Databases = 'Databases',
    DeveloperTools = 'Developer Tools',
    Devices = 'Devices',
    Documents = 'Documents',
    DripEmails = 'Drip Emails',
    eCommerce = 'eCommerce',
    Education = 'Education',
    Email = 'Email',
    EmailNewsletters = 'Email Newsletters',
    EventManagement = 'Event Management',
    Fax = 'Fax',
    FileManagementStorage = 'File Management & Storage',
    Filters = 'Filters',
    Fitness = 'Fitness',
    FormsSurveys = 'Forms & Surveys',
    Fundraising = 'Fundraising',
    Gaming = 'Gaming',
    HRTalentRecruitment = 'HR Talent & Recruitment',
    HumanResources = 'Human Resources',
    ImagesDesign = 'Images & Design',
    InternetOfThings = 'Internet of Things',
    ProposalInvoiceManagement = 'Proposal & Invoice Management',
    ITOperations = 'IT Operations',
    OnlineCourses = 'Online Courses',
    LifestyleEntertainment = 'Lifestyle & Entertainment',
    Marketing = 'Marketing',
    MarketingAutomation = 'Marketing Automation',
    NewsLifestyle = 'News & Lifestyle',
    Notes = 'Notes',
    Notifications = 'Notifications',
    PaymentProcessing = 'Payment Processing',
    PhoneSMS = 'Phone & SMS',
    Printing = 'Printing',
    ProductManagement = 'Product Management',
    Productivity = 'Productivity',
    ProjectManagement = 'Project Management',
    Reviews = 'Reviews',
    SalesCRM = 'Sales & CRM',
    SchedulingBooking = 'Scheduling & Booking',
    SecurityIdentityTools = 'Security & Identity Tools',
    ServerMonitoring = 'Server Monitoring',
    Signatures = 'Signatures',
    SocialMediaAccounts = 'Social Media Accounts',
    SocialMediaMarketing = 'Social Media Marketing',
    Spreadsheets = 'Spreadsheets',
    Support = 'Support',
    Taxes = 'Taxes',
    TeamChat = 'Team Chat',
    TeamCollaboration = 'Team Collaboration',
    TimeTrackingSoftware = 'Time Tracking Software',
    TaskManagement = 'Task Management',
    TransactionalEmail = 'Transactional Email',
    Transcription = 'Transcription',
    URLShortener = 'URL Shortener',
    VideoAudio = 'Video & Audio',
    VideoConferencing = 'Video Conferencing',
    Webinars = 'Webinars',
    WebsiteAppBuilding = 'Website & App Building',
  }

  export const defaultApp: SaaS = {
    persona: 'Coder',
    problem: {
      villain: 'Boilerplate',
      internal: 'Hates repetitive tasks',
      external: 'Needs to build a SaaS',
      philosophical: 'What tech stack is best?',
    },
    solution: 'SaaSkit.js.org',
    brand: 'SaaS.Dev',
    offer: 'Headless SaaS Platform',
    callToAction: {
      build: { 
        price: 0 
      }
    },
    failure: 'Endless complexity and lost opportunities',
    success: {
      goal: 'Building a Unicorn',
      transformation: { 
        from: 'Struggling to Ship', 
        to: 'Titan of SaaS'
      }
    },
    theme: {
      logo: {
        font: 'Roboto',
        color: 'gray-900',
        icon: 'cube',
      },
      primaryColor: '',
      accentColor: '',
      backgroundColor: '',
      font: '',
    },
    experiments: [{
      problem: {
        villain: 'Friction'
      }
    }]
  }