
import React, { useRef } from 'react';
import { Upload, FileText, X, Plus } from 'lucide-react';
import { UploadedFile } from '../types';

interface FileUploadProps {
  onFilesSelect: (files: UploadedFile[]) => void;
  selectedFiles: UploadedFile[];
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelect, selectedFiles }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const remainingSlots = 2 - selectedFiles.length;
    
    if (newFiles.length > remainingSlots) {
      alert(`Limit exceeded: System restricted to 2 documents per filing.`);
      return;
    }

    const processedFiles: Promise<UploadedFile>[] = newFiles.slice(0, remainingSlots).map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve({
            base64: base64String,
            mimeType: file.type,
            name: file.name
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(processedFiles).then(results => {
      onFilesSelect([...selectedFiles, ...results]);
    });
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    onFilesSelect(updated);
  };

  return (
    <div className="space-y-6">      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {selectedFiles.map((file, idx) => (
          <div key={idx} className="relative group bg-slate-50 dark:bg-slate-800/50 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl p-5 flex items-center gap-4 shadow-lg shadow-indigo-500/5 transition-colors">
            <div className="bg-indigo-600/10 p-3 rounded-xl text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 transition-colors">
              <FileText size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-slate-900 dark:text-white truncate uppercase tracking-tighter">{file.name}</p>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{file.mimeType.split('/')[1]}</p>
            </div>
            <button 
              onClick={() => removeFile(idx)}
              className="p-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/30 transition-all shadow-sm"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {selectedFiles.length < 2 && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 rounded-[2rem] p-5 flex items-center justify-center cursor-pointer transition-all gap-3 text-slate-400 dark:text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 group"
          >
            <Plus size={20} className="group-hover:scale-125 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Add Document {selectedFiles.length + 1}</span>
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/*,application/pdf"
              multiple
              onChange={handleFileChange}
            />
          </div>
        )}
      </div>

      {selectedFiles.length === 0 && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 rounded-[3rem] p-16 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
        >
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl mb-4 text-slate-400 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-500 group-hover:scale-110 transition-all border border-slate-200 dark:border-slate-800 group-hover:border-indigo-500/30 shadow-sm">
            <Upload size={32} />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">
            Drop billing evidence here or <span className="text-indigo-600 dark:text-indigo-400">browse files</span>
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-600 font-black uppercase tracking-widest mt-2">Max Payload: 2 Files · PDF/JPG/PNG</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
