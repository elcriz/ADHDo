import React, { createContext, useContext, useState } from 'react';

interface EditingContextType {
  isAnyEditing: boolean;
  setIsAnyEditing: (editing: boolean) => void;
  editingTodoId: string | null;
  setEditingTodoId: (id: string | null) => void;
}

const EditingContext = createContext<EditingContextType | undefined>(undefined);

export const useEditing = () => {
  const context = useContext(EditingContext);
  if (context === undefined) {
    throw new Error('useEditing must be used within an EditingProvider');
  }
  return context;
};

interface EditingProviderProps {
  children: React.ReactNode;
}

export const EditingProvider: React.FC<EditingProviderProps> = ({ children }) => {
  const [isAnyEditing, setIsAnyEditing] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);

  const value: EditingContextType = {
    isAnyEditing,
    setIsAnyEditing,
    editingTodoId,
    setEditingTodoId,
  };

  return (
    <EditingContext.Provider value={value}>
      {children}
    </EditingContext.Provider>
  );
};
