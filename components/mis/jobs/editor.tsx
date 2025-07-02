// components/editor.tsx
'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Import ReactQuill CSS
import 'react-quill/dist/quill.snow.css';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-[300px] border rounded-md flex items-center justify-center">Loading editor...</div>
});

interface EditorProps {
  value: string;
  onChange: (content: string) => void;
}

export default function Editor({ value, onChange }: EditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean']
    ]
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list',
    'link'
  ];

  if (!isMounted) {
    return <div className="h-[300px] border rounded-md flex items-center justify-center">Loading editor...</div>;
  }

  return (
    <div className="bg-white border rounded-md">
      <style jsx global>{`
        .ql-editor {
          min-height: 200px;
          font-size: 14px;
          line-height: 1.5;
        }
        .ql-toolbar {
          border-top-left-radius: 6px;
          border-top-right-radius: 6px;
        }
        .ql-container {
          border-bottom-left-radius: 6px;
          border-bottom-right-radius: 6px;
        }
        .ql-snow .ql-tooltip {
          z-index: 1000;
        }
      `}</style>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        style={{ height: '300px' }}
        placeholder="Enter job description..."
      />
    </div>
  );
}