// 단어 데이터 타입
export interface Word {
  id: string;
  english: string;
  korean: string;
}

// 퀴즈 답변 타입
export interface QuizAnswer {
  wordId: string;
  userAnswer: string;
  isCorrect: boolean;
}

// 퀴즈 결과 타입
export interface QuizResult {
  englishToKorean: QuizAnswer[];
  koreanToEnglish: QuizAnswer[];
  totalTime: number;
  chapter: number;
  startTime: number;
  targetTime?: number;
}

// 학습 세션(Chapter) 타입
export interface StudySession {
  id: string;
  words: Word[];
  createdAt: string;
  isReview?: boolean;
  wrongDirections?: { wordId: string; direction: 'engToKor' | 'korToEng' }[];
} 