import { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { Audio } from 'expo-av'

import { useNavigation, useRoute } from '@react-navigation/native';
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming
} from 'react-native-reanimated';

import { useAnimatedScrollHandler } from 'react-native-reanimated';



import { styles } from './styles';

import { QUIZ } from '../../data/quiz';
import { historyAdd } from '../../storage/quizHistoryStorage';

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { ConfirmButton } from '../../components/ConfirmButton';
import { Loading } from '../../components/Loading';
import { OutlineButton } from '../../components/OutlineButton';
import { ProgressBar } from '../../components/ProgressBar';
import { Question } from '../../components/Question';
import { QuizHeader } from '../../components/QuizHeader';
import { OverlayFeedback } from '../../components/OverlayFeedback'
import { THEME } from '../../styles/theme';

interface Params {
  id: string;
}

type QuizProps = typeof QUIZ[0];

export function Quiz() {
  const [points, setPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quiz, setQuiz] = useState<QuizProps>({} as QuizProps);
  const [alternativeSelected, setAlternativeSelected] = useState<null | number>(null);

  const shakeSharedValue = useSharedValue(0)
  const scrollYSharedValue = useSharedValue(0)
  const cardPositionSharedValue = useSharedValue(0)

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollYSharedValue.value = event.contentOffset.y
    }
  })

  const { navigate } = useNavigation();

  const CARD_INCLINATION = 20
  const CARD_SKIP_AREA = -200


  const route = useRoute();
  const { id } = route.params as Params;

  async function playAudio(isCorrect: boolean) {

    const file = isCorrect ? require('../../assets/correct.mp3') : require('../../assets/wrong.mp3')

    const { sound } = await Audio.Sound.createAsync(file, { shouldPlay: true, volume: 1 });

    await sound.setPositionAsync(0);
    await sound.playAsync()

  }

  function handleSkipConfirm() {
    Alert.alert('Pular', 'Deseja realmente pular a questão?', [
      { text: 'Sim', onPress: () => handleNextQuestion() },
      { text: 'Não', onPress: () => { } }
    ]);
  }

  async function handleFinished() {
    await historyAdd({
      id: new Date().getTime().toString(),
      title: quiz.title,
      level: quiz.level,
      points,
      questions: quiz.questions.length
    });

    navigate('finish', {
      points: String(points),
      total: String(quiz.questions.length),
    });
  }

  function handleNextQuestion() {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prevState => prevState + 1)
    } else {
      handleFinished();
    }
  }

  async function handleConfirm() {
    if (alternativeSelected === null) {
      return handleSkipConfirm();
    }

    if (quiz.questions[currentQuestion].correct === alternativeSelected) {
      playAudio(true)
      setPoints(prevState => prevState + 1);
    } else {
      playAudio(false)
      shakeAnimation()
    }

    setAlternativeSelected(null);
  }

  function handleStop() {
    Alert.alert('Parar', 'Deseja parar agora?', [
      {
        text: 'Não',
        style: 'cancel',
      },
      {
        text: 'Sim',
        style: 'destructive',
        onPress: () => navigate('home')
      },
    ]);

    return true;
  }

  function shakeAnimation() {
    shakeSharedValue.value = withSequence(
      withTiming(3, { duration: 400, easing: Easing.bounce }),
      withTiming(0)
    );
  }

  const shakeStyleAnimated = useAnimatedStyle(() => {
    return {
      transform: [{
        translateX: interpolate(
          shakeSharedValue.value,
          [0, 0.5, 1, 1.5, 2, 2.5, 0],
          [0, -15, 0, 15, 0, -15, 0],
        )
      }]
    }
  })

  const fixedProgressBarStyles = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      paddingTop: 50,
      backgroundColor: THEME.COLORS.GREY_500,
      width: '110%',
      zIndex: 1,
      opacity: interpolate(scrollYSharedValue.value, [50, 90], [0, 1], Extrapolate.CLAMP),
      transform: [
        { translateY: interpolate(scrollYSharedValue.value, [50, 100], [-40, 0], Extrapolate.CLAMP) }
      ]
    }
  })

  useEffect(() => {
    const quizSelected = QUIZ.filter(item => item.id === id)[0];
    setQuiz(quizSelected);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (quiz.questions) {
      handleNextQuestion();
    }
  }, [points]);

  const onPan = Gesture
    .Pan()
    .onUpdate((event) => {
      const moveToLeft = event.translationX < 0
      if (moveToLeft) {
        cardPositionSharedValue.value = event.translationX
      }
    })
    .onEnd(event => {
      if (event.translationX < CARD_SKIP_AREA) {
        runOnJS(handleSkipConfirm)()
      }
      cardPositionSharedValue.value = withTiming(0)
    })

  const dragStyles = useAnimatedStyle(() => {
    const rotateZValue = cardPositionSharedValue.value / CARD_INCLINATION
    return {
      transform: [
        { rotateZ: `${rotateZValue}deg` },
        { translateX: cardPositionSharedValue.value * 1.5 }
      ]
    }
  })

  if (isLoading) {
    return <Loading />
  }




  return (
    <View style={styles.container}>
      <OverlayFeedback color='orange' />
      <Animated.View
        style={fixedProgressBarStyles}
      >
        <Text style={styles.title}>{quiz.title}</Text>
        <ProgressBar total={quiz.questions.length} current={currentQuestion + 1} />
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.question}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <QuizHeader
          title={quiz.title}
          currentQuestion={currentQuestion + 1}
          totalOfQuestions={quiz.questions.length}
        />

        <GestureDetector gesture={onPan}>
          <Animated.View
            style={[shakeStyleAnimated, dragStyles]}
          >
            <Question
              key={quiz.questions[currentQuestion].title}
              question={quiz.questions[currentQuestion]}
              alternativeSelected={alternativeSelected}
              setAlternativeSelected={setAlternativeSelected}
            />
          </Animated.View>
        </GestureDetector>

        <View style={styles.footer}>
          <OutlineButton title="Parar" onPress={handleStop} />
          <ConfirmButton onPress={handleConfirm} />
        </View>
      </Animated.ScrollView>
    </View >
  );
}