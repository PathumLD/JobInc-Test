// components/editor-readonly.tsx
'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

interface EditorProps {
  value: string;
}

export default function EditorReadOnly({ value }: EditorProps) {
  const ReactQuill = useMemo(() => dynamic(() => import('react-quill'), { ssr: false }), []);

  return (
    <ReactQuill
      theme="bubble"
      value={value}
      readOnly={true}
      className="border-none"
    />
  );
}