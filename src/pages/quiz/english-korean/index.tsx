'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Word, QuizAnswer, StudySession } from '@/types';

export default function EnglishKoreanQuiz() {
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
        const engToKorWords = session.words.filter(word => 
          session.wrongDirections?.some(wd => 
            wd.wordId === word.id && wd.direction === 'engToKor'
          )
        );
        setWords(engToKorWords);
      } else {
        setWords(session.words);
      }

      localStorage.setItem('startTime', Date.now().toString());
    } catch (error) {
      console.error('세션 데이터 로드 실패:', error);
      void router.replace('/');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    // 답안 생성
    const quizAnswers: QuizAnswer[] = words.map(word => ({
      wordId: word.id,
      userAnswer: answers[word.id] || '',
      isCorrect: answers[word.id]?.trim() === word.korean.trim()
    }));

    // 답안 저장
    localStorage.setItem('englishToKorean', JSON.stringify(quizAnswers));

    // 다음 페이지로 이동
    router.push('/quiz/korean-english');
  };

  const handleInputChange = (wordId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [wordId]: value
    }));
  };

  // 엔터 키로 다음 입력창으로 이동
  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextInput = document.getElementById(`answer-${currentIndex + 1}`);
      if (nextInput) {
        nextInput.focus();
      } else {
        // form?.requestSubmit() 대신 submit 버튼 클릭 방식으로 변경
        const submitButton = document.querySelector('button[type="submit"]');
        if (submitButton instanceof HTMLButtonElement && !isSubmitting) {
          submitButton.click();
        }
      }
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">영어 → 한글 퀴즈</h1>

        <form id="quiz-form" onSubmit={handleSubmit} className="space-y-6">
          {words.map((word, index) => (
            <div key={word.id} className="bg-white rounded-lg shadow-sm hover:shadow transition-shadow p-6">
              <div className="flex items-center space-x-4">
                <div className="w-1/2">
                  <label className="block text-lg font-medium text-gray-800">
                    {word.english}
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
                    placeholder="한글 뜻을 입력하세요"
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
                {isSubmitting ? '제출 중...' : '다음'}
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