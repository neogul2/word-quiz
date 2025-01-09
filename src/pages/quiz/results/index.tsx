import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Word, QuizAnswer, StudySession } from '@/types';

interface SessionSummary {
  totalWords: number;
  engToKorCorrect: number;
  engToKorTotal: number;
  korToEngCorrect: number;
  korToEngTotal: number;
  totalTime: number;
  isReview: boolean;
}

interface WrongAnswer {
  word: Word | undefined;
  engToKorAnswer: string;
  korToEngAnswer: string;
  engToKorWrong: boolean;
  korToEngWrong: boolean;
}

export default function QuizResults() {
  const router = useRouter();
  const [session, setSession] = useState<StudySession | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [englishToKorean, setEnglishToKorean] = useState<QuizAnswer[]>([]);
  const [koreanToEnglish, setKoreanToEnglish] = useState<QuizAnswer[]>([]);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [showingWrongAnswers, setShowingWrongAnswers] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previousSessions, setPreviousSessions] = useState<SessionSummary[]>([]);

  const calculateScore = (answers: QuizAnswer[]) => {
    const correct = answers.filter(a => a.isCorrect).length;
    return {
      correct,
      incorrect: answers.length - correct,
      total: answers.length,
      percentage: Math.round((correct / answers.length) * 100)
    };
  };

  const getWordById = (id: string) => words.find(w => w.id === id);

  const getWrongAnswers = () => {
    const wrongWords = new Map<string, WrongAnswer>();
    
    englishToKorean.forEach(answer => {
      if (!answer.isCorrect) {
        const word = getWordById(answer.wordId);
        if (wrongWords.has(answer.wordId)) {
          wrongWords.get(answer.wordId)!.engToKorAnswer = answer.userAnswer;
          wrongWords.get(answer.wordId)!.engToKorWrong = true;
        } else {
          wrongWords.set(answer.wordId, {
            word,
            engToKorAnswer: answer.userAnswer,
            korToEngAnswer: '',
            engToKorWrong: true,
            korToEngWrong: false
          });
        }
      }
    });
    
    koreanToEnglish.forEach(answer => {
      if (!answer.isCorrect) {
        const word = getWordById(answer.wordId);
        if (wrongWords.has(answer.wordId)) {
          wrongWords.get(answer.wordId)!.korToEngAnswer = answer.userAnswer;
          wrongWords.get(answer.wordId)!.korToEngWrong = true;
        } else {
          wrongWords.set(answer.wordId, {
            word,
            engToKorAnswer: '',
            korToEngAnswer: answer.userAnswer,
            engToKorWrong: false,
            korToEngWrong: true
          });
        }
      }
    });

    return Array.from(wrongWords.values());
  };

  useEffect(() => {
    try {
      const sessionData = localStorage.getItem('currentSession');
      const engToKor = localStorage.getItem('englishToKorean');
      const korToEng = localStorage.getItem('koreanToEnglish');
      const startTime = localStorage.getItem('startTime');
      const previousSessionsData = localStorage.getItem('previousSessions') || '[]';

      if (!sessionData || !engToKor || !korToEng || !startTime) {
        void router.replace('/');
        return;
      }

      const currentSession = JSON.parse(sessionData);
      setSession(currentSession);
      setWords(currentSession.words);
      setEnglishToKorean(JSON.parse(engToKor));
      setKoreanToEnglish(JSON.parse(korToEng));
      setTotalTime(Math.floor((Date.now() - Number(startTime)) / 1000));
      setPreviousSessions(JSON.parse(previousSessionsData));
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      void router.replace('/');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const startWrongAnswersQuiz = () => {
    const wrongAnswers = getWrongAnswers();
    
    // 각 단어의 틀린 방향에 대한 퀴즈 정보 생성
    const wrongDirections: { wordId: string; direction: 'engToKor' | 'korToEng' }[] = [];
    wrongAnswers.forEach(wa => {
      if (wa.engToKorWrong) {
        wrongDirections.push({ wordId: wa.word!.id, direction: 'engToKor' });
      }
      if (wa.korToEngWrong) {
        wrongDirections.push({ wordId: wa.word!.id, direction: 'korToEng' });
      }
    });

    if (wrongDirections.length === 0) return;

    // 틀린 단어들만 포함하는 새 세션 생성
    const wrongWords = Array.from(new Set(wrongDirections.map(d => d.wordId)))
      .map(id => wrongAnswers.find(wa => wa.word?.id === id)?.word)
      .filter((word): word is Word => !!word);

    // currentSession을 더 안전하게 가져오기
    const sessionData = localStorage.getItem('currentSession');
    if (!sessionData) {
      console.error('현재 세션을 찾을 수 없습니다.');
      return;
    }

    const currentSession = JSON.parse(sessionData) as StudySession;

    const newSession: StudySession = {
      id: Date.now().toString(),
      words: wrongWords,
      createdAt: new Date().toISOString(),
      date: new Date().toISOString(),
      isReview: true,
      wrongDirections,
      chapter: currentSession.chapter ?? 1, // null 병합 연산자 사용
      targetTime: currentSession.targetTime ?? 10 // null 병합 연산자 사용
    };

    localStorage.removeItem('englishToKorean');
    localStorage.removeItem('koreanToEnglish');
    localStorage.removeItem('startTime');
    localStorage.setItem('currentSession', JSON.stringify(newSession));
    localStorage.setItem('startTime', Date.now().toString());

    void router.push('/quiz/english-korean');

    const currentSessionSummary: SessionSummary = {
      totalWords: words.length,
      engToKorCorrect: englishScore.correct,
      engToKorTotal: englishScore.total,
      korToEngCorrect: koreanScore.correct,
      korToEngTotal: koreanScore.total,
      totalTime,
      isReview: !!session?.isReview
    };

    const updatedSessions = [...previousSessions, currentSessionSummary];
    localStorage.setItem('previousSessions', JSON.stringify(updatedSessions));
    localStorage.setItem(`session_${previousSessions.length}_data`, JSON.stringify({
      words,
      englishToKorean,
      koreanToEnglish,
      isReview: !!session?.isReview
    }));
  };

  const calculateTotalSummary = () => {
    const allSessions = [...previousSessions, {
      totalWords: words.length,
      engToKorCorrect: englishScore.correct,
      engToKorTotal: englishScore.total,
      korToEngCorrect: koreanScore.correct,
      korToEngTotal: koreanScore.total,
      totalTime,
      isReview: !!session?.isReview
    }];

    return {
      totalTime: allSessions.reduce((sum, session) => sum + session.totalTime, 0),
      totalWords: allSessions.reduce((sum, session) => sum + session.totalWords, 0),
      totalCorrect: allSessions.reduce((sum, session) => sum + session.engToKorCorrect, 0),
      totalIncorrect: allSessions.reduce((sum, session) => sum + session.korToEngCorrect, 0),
      sessionCount: allSessions.length
    };
  };

  const clearAllData = () => {
    // 모든 로컬 스토리지 데이터 초기화
    localStorage.clear(); // 모든 데이터를 한 번에 삭제
    
    // 또는 개별적으로 삭제할 경우:
    // localStorage.removeItem('currentSession');
    // localStorage.removeItem('englishToKorean');
    // localStorage.removeItem('koreanToEnglish');
    // localStorage.removeItem('startTime');
    // localStorage.removeItem('previousSessions');
    
    setPreviousSessions([]); // 현재 상태의 previousSessions도 초기화
    void router.push('/');
  };

  if (isLoading || !session || words.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </main>
    );
  }

  const englishScore = calculateScore(englishToKorean);
  const koreanScore = calculateScore(koreanToEnglish);

  const totalSummary = calculateTotalSummary();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">퀴즈 결과</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">학습 요약</h2>
            <div className="grid grid-cols-1 gap-4">
              {[...previousSessions, {
                totalWords: words.length,
                engToKorCorrect: englishScore.correct,
                engToKorTotal: englishScore.total,
                korToEngCorrect: koreanScore.correct,
                korToEngTotal: koreanScore.total,
                totalTime,
                isReview: !!session?.isReview
              }].map((session, index, array) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-700">
                    {index === array.length - 1 ? "현재 세션" : `${index + 1}차 학습`}
                    {session.isReview && " (복습)"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-4 bg-blue-50 rounded-lg text-center">
                      <p className="text-sm text-gray-600 mb-1">소요시간</p>
                      <p className="text-xl font-bold text-gray-800">
                        {Math.floor(session.totalTime / 60)}분 {session.totalTime % 60}초
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <p className="text-sm text-gray-600 mb-1">영어→한글</p>
                      <p className="text-xl font-bold text-gray-800">
                        {Math.round((session.engToKorCorrect / session.engToKorTotal) * 100)}%
                      </p>
                      <p className="text-sm text-gray-600">
                        ({session.engToKorCorrect}/{session.engToKorTotal}문제)
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg text-center">
                      <p className="text-sm text-gray-600 mb-1">한글→영어</p>
                      <p className="text-xl font-bold text-gray-800">
                        {Math.round((session.korToEngCorrect / session.korToEngTotal) * 100)}%
                      </p>
                      <p className="text-sm text-gray-600">
                        ({session.korToEngCorrect}/{session.korToEngTotal}문제)
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">틀린 단어 목록</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left text-gray-700">영어</th>
                    <th className="p-3 text-left text-gray-700">한글</th>
                    <th className="p-3 text-left text-gray-700">영→한 답안</th>
                    <th className="p-3 text-left text-gray-700">한→영 답안</th>
                    <th className="p-3 text-left text-gray-700">틀린 방향</th>
                  </tr>
                </thead>
                <tbody>
                  {getWrongAnswers().map(({ word, engToKorAnswer, korToEngAnswer, engToKorWrong, korToEngWrong }) => (
                    <tr key={word?.id} className="border-t">
                      <td className="p-3 text-gray-800">{word?.english}</td>
                      <td className="p-3 text-gray-800">{word?.korean}</td>
                      <td className="p-3 text-red-600">{engToKorWrong ? engToKorAnswer : '정답'}</td>
                      <td className="p-3 text-red-600">{korToEngWrong ? korToEngAnswer : '정답'}</td>
                      <td className="p-3 text-gray-600">
                        {[
                          engToKorWrong && '영→한',
                          korToEngWrong && '한→영'
                        ].filter(Boolean).join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="text-xl font-semibold mb-4 mt-8 text-gray-800">정답 목록</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left text-gray-700">영어</th>
                    <th className="p-3 text-left text-gray-700">한글</th>
                    <th className="p-3 text-left text-gray-700">영→한</th>
                    <th className="p-3 text-left text-gray-700">한→영</th>
                    <th className="p-3 text-left text-gray-700">세션</th>
                  </tr>
                </thead>
                <tbody>
                  {words.filter(word => 
                    !getWrongAnswers().some(wa => wa.word?.id === word.id)
                  ).map((word) => (
                    <tr key={`current-${word.id}`} className="border-t">
                      <td className="p-3 text-gray-800">{word.english}</td>
                      <td className="p-3 text-gray-800">{word.korean}</td>
                      <td className="p-3 text-green-600">정답</td>
                      <td className="p-3 text-green-600">정답</td>
                      <td className="p-3 text-gray-600">현재 세션</td>
                    </tr>
                  ))}
                  {previousSessions.map((prevSession, sessionIndex) => {
                    const prevSessionData = JSON.parse(localStorage.getItem(`session_${sessionIndex}_data`) || '{}');
                    const prevEngToKor = prevSessionData.englishToKorean || [];
                    const prevKorToEng = prevSessionData.koreanToEnglish || [];
                    
                    return prevSessionData.words?.filter((word: Word) => {
                      const engAnswer = prevEngToKor.find((a: QuizAnswer) => a.wordId === word.id);
                      const korAnswer = prevKorToEng.find((a: QuizAnswer) => a.wordId === word.id);
                      return (engAnswer?.isCorrect || korAnswer?.isCorrect);
                    }).map((word: Word) => (
                      <tr key={`session-${sessionIndex}-${word.id}`} className="border-t bg-gray-50">
                        <td className="p-3 text-gray-800">{word.english}</td>
                        <td className="p-3 text-gray-800">{word.korean}</td>
                        <td className="p-3 text-green-600">
                          {prevEngToKor.find((a: QuizAnswer) => a.wordId === word.id)?.isCorrect ? '정답' : '오답'}
                        </td>
                        <td className="p-3 text-green-600">
                          {prevKorToEng.find((a: QuizAnswer) => a.wordId === word.id)?.isCorrect ? '정답' : '오답'}
                        </td>
                        <td className="p-3 text-gray-600">
                          {`${sessionIndex + 1}차 학습`}
                          {prevSessionData.isReview ? ' (복습)' : ''}
                        </td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={clearAllData}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 shadow-lg hover:shadow-xl transition-all"
          >
            새 퀴즈 시작
          </button>
          {getWrongAnswers().length > 0 && (
            <button
              onClick={startWrongAnswersQuiz}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-lg hover:shadow-xl transition-all"
            >
              오답 복습하기
            </button>
          )}
        </div>
      </div>
    </main>
  );
} 