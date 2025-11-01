export const generateWrongAnswers = (correctAnswer) => {
  const wrongAnswers = new Set();
  
  while (wrongAnswers.size < 2) {
    const randomNum = Math.floor(Math.random() * 99) + 1;
    if (randomNum !== correctAnswer) {
      wrongAnswers.add(randomNum);
    }
  }
  
  return Array.from(wrongAnswers);
};

export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};