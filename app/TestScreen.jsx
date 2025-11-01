import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { initializeTestSession, getNextPlate } from "./ishihara/ishiharaLogic";

// Datos de información sobre cada tipo de daltonismo
const daltonismInfo = {
  protanopia: {
    name: "Protanomalía",
    description:
      "La protanomalía es un tipo de daltonismo que afecta la percepción del color rojo, haciendo que ciertos tonos de rojo se vean más verdes y oscuros. Esto significa que las personas con protanomalía tienen dificultades para distinguir entre los colores rojo y verde, y pueden confundir el rojo con el negro o el verde oscuro.",
    normalImage: require("../assets/images/normal/comparison_normal.png"),
    affectedImage: require("../assets/images/affected/protanopia_comparison_affected.png"),
  },
  deuteranopia: {
    name: "Deuteranomalía",
    description:
      "La deuteranomalía es un tipo de daltonismo que afecta la percepción del color verde, haciendo que ciertos tonos de verde se vean más rojos. Esto significa que las personas con deuteranomalía tienen dificultades para distinguir entre los colores verde y rojo, aunque pueden ver otros colores.",
    normalImage: require("../assets/images/normal/comparison_normal.png"),
    affectedImage: require("../assets/images/affected/deuteranopia_comparison_affected.png"),
  },
  tritanopia: {
    name: "Tritanomalía",
    description:
      "La tritanomalía es un tipo de daltonismo menos común que afecta la percepción del color azul y amarillo. Las personas con tritanomalía pueden confundir el azul con el verde y el amarillo con el violeta o rosa claro.",
    normalImage: require("../assets/images/normal/comparison_normal.png"),
    affectedImage: require("../assets/images/affected/tritanopia_comparison_affected.png"),
  },
};

const TestScreen = () => {
  const router = useRouter();
  const [sessionPlates, setSessionPlates] = useState([]);
  const [currentPlate, setCurrentPlate] = useState(null);
  const [stats, setStats] = useState({
    protanopia: { correct: 0, incorrect: 0, total: 10 },
    deuteranopia: { correct: 0, incorrect: 0, total: 10 },
    tritanopia: { correct: 0, incorrect: 0, total: 10 },
    totalCorrect: 0,
    totalIncorrect: 0,
  });
  const [testCompleted, setTestCompleted] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);

  useEffect(() => {
    startNewSession();
  }, []);

  const startNewSession = () => {
    const plates = initializeTestSession();
    setSessionPlates(plates);
    setCurrentPlate(getNextPlate(plates));
    setStats({
      protanopia: { correct: 0, incorrect: 0, total: 10 },
      deuteranopia: { correct: 0, incorrect: 0, total: 10 },
      tritanopia: { correct: 0, incorrect: 0, total: 10 },
      totalCorrect: 0,
      totalIncorrect: 0,
    });
    setTestCompleted(false);
    setDiagnosis(null);
  };

  const handleAnswer = (selectedAnswer) => {
    if (!currentPlate) return;

    const isCorrect = selectedAnswer === currentPlate.correctAnswer;

    const updatedPlates = sessionPlates.map((plate) =>
      plate === currentPlate
        ? { ...plate, answered: true, userAnswer: selectedAnswer, isCorrect }
        : plate
    );

    setStats((prevStats) => ({
      ...prevStats,
      [currentPlate.type]: {
        ...prevStats[currentPlate.type],
        correct: prevStats[currentPlate.type].correct + (isCorrect ? 1 : 0),
        incorrect: prevStats[currentPlate.type].incorrect + (isCorrect ? 0 : 1),
      },
      totalCorrect: prevStats.totalCorrect + (isCorrect ? 1 : 0),
      totalIncorrect: prevStats.totalIncorrect + (isCorrect ? 0 : 1),
    }));

    setSessionPlates(updatedPlates);

    const nextPlate = getNextPlate(updatedPlates);
    if (nextPlate) {
      setCurrentPlate(nextPlate);
    } else {
      analyzeResults();
    }
  };

  const analyzeResults = () => {
    const possibleConditions = [];

    // Verificar cada tipo de daltonismo
    Object.keys(stats).forEach((type) => {
      if (type !== "totalCorrect" && type !== "totalIncorrect") {
        const typeStats = stats[type];
        const errorRate = typeStats.incorrect / typeStats.total;

        // Si falló más del 50% en un tipo específico
        if (errorRate > 0.5) {
          possibleConditions.push(type);
        }
      }
    });

    setDiagnosis(possibleConditions);
    setTestCompleted(true);
  };

  const getProgress = () => {
    const answered = sessionPlates.filter((plate) => plate.answered).length;
    return answered;
  };

  const navigateToCamera = () => {
    router.push("/camera");
  };

  // Pantalla de resultados con diagnóstico
  if (testCompleted) {
    return (
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.resultsContainer}>
          <Text style={styles.title}>Resultados de la Prueba</Text>

          {/* Estadísticas generales */}
          <View style={styles.statsSummary}>
            <Text style={styles.statsTitle}>Resumen:</Text>
            <Text style={styles.statsItem}>
              Protanopia: {stats.protanopia.correct}/10
            </Text>
            <Text style={styles.statsItem}>
              Deuteranopia: {stats.deuteranopia.correct}/10
            </Text>
            <Text style={styles.statsItem}>
              Tritanopia: {stats.tritanopia.correct}/10
            </Text>
            <Text style={styles.totalResult}>
              Total: {stats.totalCorrect}/30
            </Text>
          </View>

          {/* Diagnóstico */}
          {diagnosis && diagnosis.length > 0 ? (
            <View style={styles.diagnosisContainer}>
              {diagnosis.map((condition, index) => {
                const info = daltonismInfo[condition];
                return (
                  <View key={condition} style={styles.conditionInfo}>
                    <Text style={styles.diagnosisTitle}>
                      Resultado: Posible {info.name}
                    </Text>
                    <Text style={styles.conditionDescription}>
                      {info.description}
                    </Text>

                    {/* Comparación de imágenes */}
                    <View style={styles.imageComparison}>
                      <View style={styles.imageContainer}>
                        <Text style={styles.imageLabel}>Visión normal</Text>
                        <Image
                          source={info.normalImage}
                          style={styles.comparisonImage}
                        />
                      </View>
                      <View style={styles.imageContainer}>
                        <Text style={styles.imageLabel}>
                          Visión con {info.name}
                        </Text>
                        <Image
                          source={info.affectedImage}
                          style={styles.comparisonImage}
                        />
                      </View>
                    </View>

                    {/* Recomendaciones */}
                    <View style={styles.recommendations}>
                      <Text style={styles.recommendationsText}>
                        Para más información acerca de esta condición o para
                        validar el resultado de esta prueba, por favor diríjase
                        con un profesional.
                        {"\n\n"}
                        Adicionalmente, puede hacer uso de nuestra herramienta
                        de asistencia.
                      </Text>
                    </View>

                    {/* Botón de herramienta de asistencia */}
                    <Pressable
                      style={styles.assistanceButton}
                      onPress={navigateToCamera}
                    >
                      <Text style={styles.assistanceButtonText}>
                        Herramienta de asistencia
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.noConditionContainer}>
              <Text style={styles.noConditionTitle}>
                Resultado: Sin indicios de daltonismo
              </Text>
              <Text style={styles.noConditionText}>
                Basado en los resultados de la prueba, no se detectaron indicios
                significativos de daltonismo. Sin embargo, si tiene dudas o
                preocupaciones sobre su visión, recomendamos consultar con un
                profesional de la salud visual.
              </Text>
            </View>
          )}

          {/* Botón para nueva prueba */}
          <Pressable style={styles.restartButton} onPress={startNewSession}>
            <Text style={styles.restartText}>Realizar otra prueba</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  // Pantalla de prueba en curso
  if (!currentPlate) {
    return <Text>Cargando prueba...</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Progreso: {getProgress()}/30</Text>
        <Text style={styles.typeText}>Tipo: {currentPlate.type}</Text>
      </View>

      <Image source={currentPlate.image} style={styles.plateImage} />

      <Text style={styles.question}>¿Qué número ves en la imagen?</Text>

      <View style={styles.answersContainer}>
        {currentPlate.answers.map((answer, index) => (
          <Pressable
            key={index}
            style={styles.answerButton}
            onPress={() => handleAnswer(answer)}
          >
            <Text style={styles.answerText}>{answer.toString()}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.quickStats}>
        <Text style={styles.statsText}>
          Aciertos: {stats.totalCorrect} • Fallos: {stats.totalIncorrect}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 20,
  },
  resultsContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  statsSummary: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: "100%",
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  statsItem: {
    fontSize: 16,
    marginVertical: 2,
  },
  totalResult: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    color: "#007AFF",
  },
  diagnosisContainer: {
    width: "100%",
    marginBottom: 20,
  },
  conditionInfo: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B6B",
    marginBottom: 15,
  },
  diagnosisTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginBottom: 10,
  },
  conditionDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 15,
    textAlign: "justify",
  },
  imageComparison: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  imageContainer: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
    textAlign: "center",
  },
  comparisonImage: {
    width: 150,
    height: 100,
    resizeMode: "contain",
    borderRadius: 8,
  },
  recommendations: {
    backgroundColor: "#e3f2fd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  recommendationsText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "justify",
  },
  assistanceButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  assistanceButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  noConditionContainer: {
    backgroundColor: "#e8f5e8",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    width: "100%",
  },
  noConditionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 10,
    textAlign: "center",
  },
  noConditionText: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: "justify",
  },
  restartButton: {
    backgroundColor: "#666",
    padding: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  restartText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  typeText: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  plateImage: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    marginBottom: 30,
  },
  question: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  answersContainer: {
    width: "100%",
    gap: 10,
  },
  answerButton: {
    backgroundColor: "#e0e0e0",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  answerText: {
    fontSize: 16,
    fontWeight: "500",
  },
  quickStats: {
    marginTop: 20,
  },
  statsText: {
    fontSize: 14,
    color: "#666",
  },
});

export default TestScreen;
