'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import { Word, StudySession } from '@/types';

export default function Home() {
  const router = useRouter();
  const [words, setWords] = useState<Word[]>([]);
  const [targetTime, setTargetTime] = useState<number>(10);
  const [error, setError] = useState<string>('');

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    const rows = text.trim().split('\n');
    
    try {
      const newWords: Word[] = rows.map((row, index) => {
        const [english, korean] = row.split('\t');
        if (!english || !korean) {
          throw new Error('잘못된 형식입니다. 엑셀에서 두 열(영어, 한글)을 복사해주세요.');
        }
        return {
          id: `word-${index}`,
          english: english.trim(),
          korean: korean.trim()
        };
      });

      setWords(newWords);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터 형식이 올바르지 않습니다.');
    }
  };

  const startQuiz = () => {
    if (words.length === 0) {
      setError('단어를 먼저 입력해주세요.');
      return;
    }

    // 학습 세션 저장
    const session: StudySession = {
      id: `session-${Date.now()}`,
      chapter: 1,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      words,
      targetTime: targetTime,
      isReview: false,
      wrongDirections: []
    };

    // localStorage에 데이터 저장
    localStorage.setItem('currentSession', JSON.stringify(session));
    localStorage.setItem('startTime', Date.now().toString());

    // 영어→한글 퀴즈 페이지로 이동
    router.push('/quiz/english-korean');
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">단어 학습</h1>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-700">목표 시간 (분):</label>
          <input 
            type="number"
            min="1"
            value={targetTime}
            onChange={(e) => setTargetTime(Math.max(1, parseInt(e.target.value) || 10))}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div 
          className="border-2 border-dashed border-blue-300 p-8 mb-6 text-center rounded-lg cursor-pointer hover:bg-blue-50 bg-white"
          onPaste={handlePaste}
        >
          <p className="text-gray-700">여기에 엑셀 데이터를 붙여넣으세요</p>
          <p className="text-sm text-gray-600 mt-2">
            (영어 ↔ 한글 두 열을 복사해주세요)
          </p>
        </div>

        {words.length > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-3 p-4 border-b text-gray-800">
              단어 목록 ({words.length}개)
            </h2>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="p-3 text-left text-gray-700 font-semibold">영어</th>
                    <th className="p-3 text-left text-gray-700 font-semibold">한글</th>
                  </tr>
                </thead>
                <tbody>
                  {words.map((word) => (
                    <tr key={word.id} className="hover:bg-gray-50 border-t">
                      <td className="p-3 text-gray-800">{word.english}</td>
                      <td className="p-3 text-gray-800">{word.korean}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={startQuiz}
            disabled={words.length === 0}
            className={`
              px-8 py-4 rounded-lg font-semibold text-white text-lg
              transition-all duration-200
              ${words.length === 0 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 shadow-lg hover:shadow-xl'}
            `}
          >
            퀴즈 시작
          </button>
        </div>
      </div>
    </main>
  );
}
