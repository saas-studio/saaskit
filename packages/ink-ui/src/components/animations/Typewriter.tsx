import React, { useState, useEffect } from 'react';
import { Text, Box } from 'ink';
import { colors } from '../../theme/colors.js';
import { selection } from '../../theme/icons.js';

export interface TypewriterProps {
  /** Text to type out */
  text: string;
  /** Typing speed in ms per character */
  speed?: number;
  /** Show blinking cursor */
  cursor?: boolean;
  /** Cursor character */
  cursorChar?: string;
  /** Cursor color */
  cursorColor?: string;
  /** Delay before starting */
  delay?: number;
  /** Callback when typing completes */
  onComplete?: () => void;
  /** Text color */
  color?: string;
  /** Whether to loop the animation */
  loop?: boolean;
  /** Pause duration at end before looping */
  loopPause?: number;
}

/**
 * Typewriter text animation
 *
 * @example
 * ```tsx
 * <Typewriter
 *   text="Welcome to the CLI!"
 *   speed={50}
 *   cursor
 *   onComplete={() => setShowNextStep(true)}
 * />
 * ```
 */
export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  speed = 50,
  cursor = true,
  cursorChar = selection.cursor,
  cursorColor = colors.primary[500],
  delay = 0,
  onComplete,
  color = colors.neutral[700],
  loop = false,
  loopPause = 2000,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [started, setStarted] = useState(delay === 0);

  // Handle initial delay
  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setStarted(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  // Typewriter animation
  useEffect(() => {
    if (!started) return;

    let currentIndex = 0;
    let typingTimer: NodeJS.Timeout;
    let loopTimer: NodeJS.Timeout;

    const type = () => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
        typingTimer = setTimeout(type, speed);
      } else {
        setIsComplete(true);
        onComplete?.();

        if (loop) {
          loopTimer = setTimeout(() => {
            currentIndex = 0;
            setDisplayedText('');
            setIsComplete(false);
            type();
          }, loopPause);
        }
      }
    };

    type();

    return () => {
      clearTimeout(typingTimer);
      clearTimeout(loopTimer);
    };
  }, [text, speed, started, onComplete, loop, loopPause]);

  // Cursor blinking
  useEffect(() => {
    if (!cursor) return;

    const cursorTimer = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);

    return () => clearInterval(cursorTimer);
  }, [cursor]);

  return (
    <Text>
      <Text color={color}>{displayedText}</Text>
      {cursor && (!isComplete || loop) && (
        <Text color={cursorColor}>{showCursor ? cursorChar : ' '}</Text>
      )}
    </Text>
  );
};

/**
 * Multi-line typewriter (types line by line)
 */
export interface MultiLineTypewriterProps {
  /** Lines to type */
  lines: string[];
  /** Speed per character */
  charSpeed?: number;
  /** Delay between lines */
  lineDelay?: number;
  /** Show cursor on current line */
  cursor?: boolean;
  /** Prefix for each line */
  prefix?: string;
  /** Callback when all lines complete */
  onComplete?: () => void;
}

export const MultiLineTypewriter: React.FC<MultiLineTypewriterProps> = ({
  lines,
  charSpeed = 30,
  lineDelay = 500,
  cursor = true,
  prefix = '$ ',
  onComplete,
}) => {
  const [currentLine, setCurrentLine] = useState(0);
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(true);

  const handleLineComplete = () => {
    setCompletedLines((prev) => [...prev, lines[currentLine]]);

    if (currentLine < lines.length - 1) {
      setIsTyping(false);
      setTimeout(() => {
        setCurrentLine((prev) => prev + 1);
        setIsTyping(true);
      }, lineDelay);
    } else {
      onComplete?.();
    }
  };

  return (
    <Box flexDirection="column">
      {/* Completed lines */}
      {completedLines.map((line, i) => (
        <Box key={i}>
          <Text color={colors.neutral[500]}>{prefix}</Text>
          <Text color={colors.neutral[700]}>{line}</Text>
        </Box>
      ))}

      {/* Current typing line */}
      {currentLine < lines.length && (
        <Box>
          <Text color={colors.neutral[500]}>{prefix}</Text>
          {isTyping ? (
            <Typewriter
              text={lines[currentLine]}
              speed={charSpeed}
              cursor={cursor}
              onComplete={handleLineComplete}
            />
          ) : null}
        </Box>
      )}
    </Box>
  );
};

/**
 * Typewriter with delete/backspace animation
 */
export interface TypeDeleteProps {
  /** Words to cycle through */
  words: string[];
  /** Typing speed */
  typeSpeed?: number;
  /** Delete speed */
  deleteSpeed?: number;
  /** Pause after typing */
  typePause?: number;
  /** Pause after deleting */
  deletePause?: number;
  /** Text color */
  color?: string;
}

export const TypeDelete: React.FC<TypeDeleteProps> = ({
  words,
  typeSpeed = 100,
  deleteSpeed = 50,
  typePause = 2000,
  deletePause = 500,
  color = colors.neutral[700],
}) => {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  // Main animation loop
  useEffect(() => {
    const currentWord = words[wordIndex];

    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      // Typing
      if (text.length < currentWord.length) {
        timer = setTimeout(() => {
          setText(currentWord.slice(0, text.length + 1));
        }, typeSpeed);
      } else {
        // Finished typing, pause then start deleting
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, typePause);
      }
    } else {
      // Deleting
      if (text.length > 0) {
        timer = setTimeout(() => {
          setText(text.slice(0, -1));
        }, deleteSpeed);
      } else {
        // Finished deleting, move to next word
        timer = setTimeout(() => {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }, deletePause);
      }
    }

    return () => clearTimeout(timer);
  }, [text, wordIndex, isDeleting, words, typeSpeed, deleteSpeed, typePause, deletePause]);

  // Cursor blink
  useEffect(() => {
    const timer = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(timer);
  }, []);

  return (
    <Text>
      <Text color={color}>{text}</Text>
      <Text color={colors.primary[500]}>{showCursor ? selection.cursor : ' '}</Text>
    </Text>
  );
};

/**
 * Terminal command simulation
 */
export interface TerminalCommandProps {
  /** Command to display */
  command: string;
  /** Output lines after command */
  output?: string[];
  /** Delay before showing output */
  outputDelay?: number;
  /** Prompt character */
  prompt?: string;
  /** Prompt color */
  promptColor?: string;
}

export const TerminalCommand: React.FC<TerminalCommandProps> = ({
  command,
  output = [],
  outputDelay = 300,
  prompt = '$ ',
  promptColor = colors.success[500],
}) => {
  const [showOutput, setShowOutput] = useState(false);
  const [visibleOutputLines, setVisibleOutputLines] = useState(0);

  const handleCommandComplete = () => {
    setTimeout(() => setShowOutput(true), outputDelay);
  };

  useEffect(() => {
    if (!showOutput || visibleOutputLines >= output.length) return;

    const timer = setTimeout(() => {
      setVisibleOutputLines((prev) => prev + 1);
    }, 50);

    return () => clearTimeout(timer);
  }, [showOutput, visibleOutputLines, output.length]);

  return (
    <Box flexDirection="column">
      <Box>
        <Text color={promptColor}>{prompt}</Text>
        <Typewriter
          text={command}
          speed={40}
          cursor={!showOutput}
          onComplete={handleCommandComplete}
        />
      </Box>
      {showOutput && output.slice(0, visibleOutputLines).map((line, i) => (
        <Text key={i} color={colors.neutral[600]}>{line}</Text>
      ))}
    </Box>
  );
};

export default Typewriter;
