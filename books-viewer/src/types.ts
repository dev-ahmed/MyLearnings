export interface Book {
  title: string;
  category: string;
  format: 'pdf' | 'epub';
  path: string;
  filename: string;
}

export type Category = 'languages' | 'infrastructure' | 'ai-and-ml';
