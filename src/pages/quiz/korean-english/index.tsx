'use client';

import { useState, useEffect } from 'react';
import { useRouter, NextRouter } from 'next/router';
import { Word, QuizAnswer, StudySession } from '@/types';

export default function KoreanEnglishQuiz() {
  const router = useRouter();
  const [words, setWords] = useState<Word[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [session, setSession] = useState<StudySession | null>(null);

  useEffect(() => {
    try {
      const sessionData = localStorage.getItem('currentSession');
      if (!sessionData) {
        void router.replace('/');
        return;
      }

      const session: StudySession = JSON.parse(sessionData);
      setSession(session);

      // 오답 복습 세션인 경우 틀린 방향의 단어만 필터링
      if (session.isReview && session.wrongDirections) {
        const korToEngWords = session.words.filter(word => 
          session.wrongDirections?.some(wd => 
            wd.wordId === word.id && wd.direction === 'korToEng'
          )
        );
        setWords(korToEngWords);
      } else {
        setWords(session.words);
      }

      localStorage.setItem('startTime', Date.now().toString());
    } catch (error) {
      console.error('세션 데이터 로드 실패:', error);
      void router.replace('/');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const quizAnswers: QuizAnswer[] = words.map(word => ({
        wordId: word.id,
        userAnswer: (answers[word.id] || '').trim(),
        isCorrect: (answers[word.id] || '').trim().toLowerCase() === word.english.trim().toLowerCase()
      }));

      localStorage.setItem('koreanToEnglish', JSON.stringify(quizAnswers));

      await router.push('/quiz/results');
    } catch (error) {
      console.error('퀴즈 제출 실패:', error);
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (wordId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [wordId]: value
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextInput = document.getElementById(`answer-${currentIndex + 1}`);
      if (nextInput) {
        nextInput.focus();
      } else {
        const submitButton = document.querySelector('button[type="submit"]');
        if (submitButton instanceof HTMLButtonElement && !isSubmitting) {
          submitButton.click();
        }
      }
    }
  };

  // 데이터 로딩 중이거나 words가 비어있는 경우 처리
  if (words.length === 0) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">한글 → 영어 퀴즈</h1>

        <form id="quiz-form" onSubmit={handleSubmit} className="space-y-6">
          {words.map((word, index) => (
            <div key={word.id} className="bg-white rounded-lg shadow-sm hover:shadow transition-shadow p-6">
              <div className="flex items-center space-x-4">
                <div className="w-1/2">
                  <label htmlFor={`answer-${index}`} className="block text-lg font-medium text-gray-800">
                    {word.korean}
                  </label>
                </div>
                <div className="w-1/2">
                  <input
                    id={`answer-${index}`}
                    type="text"
                    value={answers[word.id] || ''}
                    onChange={(e) => handleInputChange(word.id, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white"
                    placeholder="영어 단어를 입력하세요"
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="sticky bottom-4 bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-lg">
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`
                  px-8 py-4 rounded-lg font-semibold text-white text-lg
                  transition-all duration-200
                  ${isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 shadow-lg hover:shadow-xl'}
                `}
              >
                {isSubmitting ? '제출 중...' : '결과 보기'}
              </button>
              <p className="mt-3 text-sm text-gray-600">
                Enter 키를 눌러 다음 문제로 이동할 수 있습니다
              </p>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
} 