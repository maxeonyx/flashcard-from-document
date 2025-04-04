import { ref, computed } from 'vue';
import type { ApiResponse } from '../types';

export interface DocumentStats {
  wordCount: number;
  charCount: number;
}

// Define supported file types
export enum FileType {
  TEXT = 'text',
  PDF = 'pdf',
  UNSUPPORTED = 'unsupported'
}

/**
 * Composable for document upload and processing
 */
export function useDocumentUpload() {
  const documentContent = ref<string>('');
  const fileName = ref<string>('');
  const isHighlighted = ref<boolean>(false);
  const error = ref<string>('');
  
  // Truncated preview of document content
  const documentPreview = computed((): string => {
    if (!documentContent.value) return '';
    return documentContent.value.length > 500 
      ? documentContent.value.substring(0, 500) + '...' 
      : documentContent.value;
  });
  
  // Word and character count statistics
  const documentStats = computed((): DocumentStats | null => {
    if (!documentContent.value) return null;
    
    const wordCount = documentContent.value.split(/\s+/).filter(Boolean).length;
    const charCount = documentContent.value.length;
    
    return { wordCount, charCount };
  });
  
  // Format document statistics for display
  const formattedStats = computed((): string => {
    const stats = documentStats.value;
    if (!stats) return '';
    return `${stats.wordCount} words, ${stats.charCount} characters`;
  });
  
  function highlightDrop(): void {
    isHighlighted.value = true;
  }
  
  function unhighlightDrop(): void {
    isHighlighted.value = false;
  }
  
  async function handleTextFile(file: File): Promise<ApiResponse<string>> {
    try {
      const text = await file.text();
      documentContent.value = text;
      fileName.value = file.name;
      error.value = '';
      return { data: text, loading: false };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      error.value = `Error reading file: ${message}`;
      return { error: error.value, loading: false };
    }
  }
  
  async function handlePdfFile(file: File): Promise<ApiResponse<string>> {
    try {
      // Check file size - 10MB limit for PDFs
      const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > MAX_PDF_SIZE) {
        error.value = `PDF file is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum size is 10MB.`;
        return { error: error.value, loading: false };
      }
      
      // Convert PDF to base64 for Claude API
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      
      // Store the original filename
      fileName.value = file.name;
      
      // Store base64 data in documentContent
      documentContent.value = base64;
      
      // Clear any previous errors
      error.value = '';
      
      return { 
        data: base64, 
        loading: false 
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      error.value = `Error processing PDF file: ${message}`;
      return { error: error.value, loading: false };
    }
  }
  
  function getFileType(file: File): FileType {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension === 'txt' || extension === 'md') {
      return FileType.TEXT;
    } else if (extension === 'pdf') {
      return FileType.PDF;
    }
    
    return FileType.UNSUPPORTED;
  }
  
  function handleDrop(e: DragEvent): void {
    unhighlightDrop();
    
    if (!e.dataTransfer?.files.length) return;
    
    const file = e.dataTransfer.files[0];
    // File type detection happens in processFile
    processFile(file);
  }
  
  function handleFileSelect(e: Event): void {
    const target = e.target as HTMLInputElement;
    if (!target.files?.length) return;
    
    const file = target.files[0];
    // File type detection happens in processFile
    processFile(file);
  }
  
  async function processFile(file: File): Promise<void> {
    const fileType = getFileType(file);
    
    switch (fileType) {
      case FileType.TEXT:
        await handleTextFile(file);
        break;
      case FileType.PDF:
        await handlePdfFile(file);
        break;
      default:
        error.value = "Unsupported file format. Please upload a .txt, .md, or .pdf file.";
    }
  }
  
  function clearDocument(): void {
    documentContent.value = '';
    fileName.value = '';
    error.value = '';
  }
  
  return {
    documentContent,
    fileName,
    isHighlighted,
    error,
    documentPreview,
    documentStats,
    formattedStats,
    
    highlightDrop,
    unhighlightDrop,
    handleTextFile,
    handlePdfFile,
    handleDrop,
    handleFileSelect,
    processFile,
    clearDocument,
    getFileType
  };
}