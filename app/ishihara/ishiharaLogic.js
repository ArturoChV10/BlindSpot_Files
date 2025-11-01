import { ishiharaPlates } from "./ishiharaData";
import { shuffleArray, generateWrongAnswers } from "./ishiharaUtils";

// Selecciona 10 placas aleatorias de cada tipo
const getRandomPlatesByType = (type, count = 10) => {
  const plates = Object.keys(ishiharaPlates[type]);
  const shuffled = shuffleArray(plates);
  return shuffled.slice(0, count);
};

export const initializeTestSession = () => {
  const types = Object.keys(ishiharaPlates);
  const sessionPlates = [];

  // Para cada tipo, tomar 10 placas aleatorias
  types.forEach((type) => {
    const typePlates = getRandomPlatesByType(type);
    typePlates.forEach((plateKey) => {
      const correctAnswer = parseInt(plateKey.replace("plate_", ""));
      const wrongAnswers = generateWrongAnswers(correctAnswer);
      const allAnswers = shuffleArray([correctAnswer, ...wrongAnswers, "Nada"]);

      sessionPlates.push({
        type,
        image: ishiharaPlates[type][plateKey],
        correctAnswer,
        answers: allAnswers,
        answered: false,
        userAnswer: null,
        isCorrect: false,
      });
    });
  });

  // Mezclar todas las placas para el test
  return shuffleArray(sessionPlates);
};

export const getNextPlate = (sessionPlates) => {
  return sessionPlates.find((plate) => !plate.answered);
};
