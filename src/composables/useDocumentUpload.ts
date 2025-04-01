import { ref, computed } from 'vue';
import type { ApiResponse } from '../types';

export interface DocumentStats {
  wordCount: number;
  charCount: number;
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
  
  function handleDrop(e: DragEvent): void {
    unhighlightDrop();
    
    if (!e.dataTransfer?.files.length) return;
    
    const file = e.dataTransfer.files[0];
    processFile(file);
  }
  
  function handleFileSelect(e: Event): void {
    const target = e.target as HTMLInputElement;
    if (!target.files?.length) return;
    
    const file = target.files[0];
    processFile(file);
  }
  
  function processFile(file: File): void {
    const fileType = file.name.split('.').pop()?.toLowerCase();
    
    if (fileType === 'txt' || fileType === 'md') {
      handleTextFile(file);
    } else if (fileType === 'pdf') {
      error.value = "PDF parsing is not supported in this version. Please upload a text file.";
    } else {
      error.value = "Unsupported file format. Please upload a .txt or .md file.";
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
    handleDrop,
    handleFileSelect,
    processFile,
    clearDocument
  };
}