import React, { useState, useEffect } from 'react';
import { ToastProvider, useToast } from '../../../ui/Toast';
import QuestionTitle from '../../../ui/AskEditQuestion/QuestionTitle';
import QuestionEditor from '../../../ui/AskEditQuestion/QuestionEditor';
import QuestionTags from '../../../ui/AskEditQuestion/QuestionTags';
import SubmitButton from '../../../ui/AskEditQuestion/SubmitButton';
import { createQuestion } from '~/services/api/topic/question.service';
import type { JSONContent } from '@tiptap/react';
import { getTagList } from '~/services/api/tags/tag.service';

const EMPTY_CONTENT: JSONContent = { type: 'doc', content: [] };

const CreateQuestionContent: React.FC = () => {
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [content, setContent] = useState<JSONContent>(EMPTY_CONTENT);
  const [editor, setEditor] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await getTagList(1, 100);
        if (res.success && res.data) {
          setTagSuggestions(res.data.map((tag) => tag.name));
        }
      } catch (err) {
        console.error('Failed to fetch tag list', err);
      }
    };

    fetchTags();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('token'));
    }
  }, []);

  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      showToast('You must be logged in to ask a question', 'error');
      return;
    }

    // Validation
    if (!title.trim()) {
      showToast('Title is required', 'error');
      return;
    }
    if (
      !content ||
      !content.content ||
      content.content.length === 0 ||
      (content.content.length === 1 && !content.content[0].content)
    ) {
      showToast('Content is required', 'error');
      return;
    }
    if (!tags || tags.length === 0) {
      showToast('At least one tag is required', 'error');
      return;
    }

    try {
      const payload = {
        title,
        tags,
        content: JSON.stringify(content),
      };

      const newQuestion = await createQuestion(payload, token);
      if (newQuestion) {
        showToast('Question created successfully', 'success');
        setTitle('');
        setTags([]);
        setContent(EMPTY_CONTENT);
        editor?.commands.setContent(EMPTY_CONTENT);
      } else {
        showToast('Failed to create question', 'error');
      }
    } catch (error) {
      console.error('Error creating question:', error);
      showToast('Error creating question', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#111217] flex flex-col items-center justify-center py-8">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-2">
        <h1 className="text-2xl font-bold text-white mb-8">
          Ask a public question
        </h1>

        <QuestionTitle title={title} onChange={setTitle} />
        {typeof window !== 'undefined' && (
          <QuestionEditor
            title="Detailed explanation of your problem?"
            content={content}
            onChange={setContent}
            editorRef={setEditor}
          />
        )}
        <QuestionTags
          tags={tags}
          onChange={setTags}
          suggestions={tagSuggestions}
          maxTags={5}
        />
        <SubmitButton />
      </form>
    </div>
  );
};

const CreateQuestion: React.FC = () => (
  <ToastProvider>
    <CreateQuestionContent />
  </ToastProvider>
);

export default CreateQuestion;
