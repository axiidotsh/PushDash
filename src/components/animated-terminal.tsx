'use client';

import { motion } from 'framer-motion';
import { Pause, Play, RotateCcw } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AnimationPhase =
  | 'idle'
  | 'typing'
  | 'waiting'
  | 'enter-flash'
  | 'spinner'
  | 'output'
  | 'next'
  | 'complete';

interface TerminalCommand {
  command: string;
  output: string[];
  spinner: boolean;
  intermediateSteps?: string[];
}

interface AnimatedTerminalProps {
  className?: string;
  autoPlay?: boolean;
  onComplete?: () => void;
}

interface TerminalState {
  phase: AnimationPhase;
  currentCommandIndex: number;
  currentCharIndex: number;
  completedCommands: number[];
  showReplayButton: boolean;
  isPaused: boolean;
  spinnerFrame: number;
  currentStepIndex: number;
}

const ANIMATION_CONFIG = {
  typeSpeed: 45,
  commandDelay: 300,
  outputLineDelay: 180,
  spinnerDuration: 1200,
  pauseBetweenCommands: 800,
  enterFlashDuration: 120,
  spinnerFrameDuration: 80,
  intermediateStepDuration: 1000,
} as const;

// Terminal-style spinner frames (braille pattern)
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

// PushDash CLI commands based on actual CLI implementation
const TERMINAL_COMMANDS: TerminalCommand[] = [
  {
    command: 'pushdash login',
    spinner: true,
    intermediateSteps: [
      'Opening browser for authentication...',
      'Waiting for authorization...',
    ],
    output: [
      '✓ Browser opened successfully',
      '✓ Logged in as dev@pushdash.dev',
    ],
  },
  {
    command: 'pushdash push ./quick-notes.md --tag "notes"',
    spinner: true,
    intermediateSteps: [
      'Reading file...',
      'Uploading quick-notes.md (4.2 KB)...',
      'Processing metadata...',
    ],
    output: [
      '✓ Uploaded quick-notes.md',
      '✓ Tagged with: notes',
      '→ pushdash.dev/dashboard/files/x7k9m2',
    ],
  },
];

export function AnimatedTerminal({
  className,
  autoPlay = true,
  onComplete,
}: AnimatedTerminalProps): React.ReactElement {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [state, setState] = useState<TerminalState>({
    phase: prefersReducedMotion ? 'complete' : 'idle',
    currentCommandIndex: 0,
    currentCharIndex: 0,
    completedCommands: prefersReducedMotion
      ? TERMINAL_COMMANDS.map((_, i) => i)
      : [],
    showReplayButton: prefersReducedMotion,
    isPaused: false,
    spinnerFrame: 0,
    currentStepIndex: 0,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const spinnerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (spinnerIntervalRef.current) {
      clearInterval(spinnerIntervalRef.current);
      spinnerIntervalRef.current = null;
    }
  }, []);

  const resetAnimation = useCallback(() => {
    clearTimer();
    setState({
      phase: 'idle',
      currentCommandIndex: 0,
      currentCharIndex: 0,
      completedCommands: [],
      showReplayButton: false,
      isPaused: false,
      spinnerFrame: 0,
      currentStepIndex: 0,
    });
  }, [clearTimer]);

  const handleReplay = useCallback(() => {
    resetAnimation();
  }, [resetAnimation]);

  const togglePause = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  useEffect(() => {
    if (!autoPlay || prefersReducedMotion || state.isPaused) return;

    const currentCommand = TERMINAL_COMMANDS[state.currentCommandIndex];

    if (state.phase === 'idle') {
      setState((prev) => ({ ...prev, phase: 'typing' }));
      return;
    }

    if (state.phase === 'typing') {
      if (state.currentCharIndex < currentCommand.command.length) {
        timeoutRef.current = setTimeout(() => {
          setState((prev) => ({
            ...prev,
            currentCharIndex: prev.currentCharIndex + 1,
          }));
        }, ANIMATION_CONFIG.typeSpeed);
      } else {
        setState((prev) => ({ ...prev, phase: 'enter-flash' }));
      }
      return;
    }

    if (state.phase === 'enter-flash') {
      timeoutRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, phase: 'waiting' }));
      }, ANIMATION_CONFIG.enterFlashDuration);
      return;
    }

    if (state.phase === 'waiting') {
      timeoutRef.current = setTimeout(() => {
        if (currentCommand.spinner) {
          setState((prev) => ({
            ...prev,
            phase: 'spinner',
            spinnerFrame: 0,
            currentStepIndex: 0,
          }));
        } else {
          setState((prev) => ({ ...prev, phase: 'output' }));
        }
      }, ANIMATION_CONFIG.commandDelay);
      return;
    }

    if (state.phase === 'spinner') {
      // Only create spinner interval if it doesn't exist
      if (!spinnerIntervalRef.current) {
        spinnerIntervalRef.current = setInterval(() => {
          setState((prev) => ({
            ...prev,
            spinnerFrame: (prev.spinnerFrame + 1) % SPINNER_FRAMES.length,
          }));
        }, ANIMATION_CONFIG.spinnerFrameDuration);
      }

      const intermediateSteps = currentCommand.intermediateSteps || [];
      const hasSteps = intermediateSteps.length > 0;

      if (hasSteps && state.currentStepIndex < intermediateSteps.length - 1) {
        // Cycle through intermediate steps
        timeoutRef.current = setTimeout(() => {
          setState((prev) => ({
            ...prev,
            currentStepIndex: prev.currentStepIndex + 1,
          }));
        }, ANIMATION_CONFIG.intermediateStepDuration);
      } else {
        // Final step or no intermediate steps - move to output
        const totalDuration = hasSteps
          ? intermediateSteps.length * ANIMATION_CONFIG.intermediateStepDuration
          : ANIMATION_CONFIG.spinnerDuration;

        timeoutRef.current = setTimeout(
          () => {
            if (spinnerIntervalRef.current) {
              clearInterval(spinnerIntervalRef.current);
              spinnerIntervalRef.current = null;
            }
            setState((prev) => ({ ...prev, phase: 'output' }));
          },
          hasSteps ? ANIMATION_CONFIG.intermediateStepDuration : totalDuration
        );
      }
      return;
    }

    if (state.phase === 'output') {
      const outputDelay =
        currentCommand.output.length * ANIMATION_CONFIG.outputLineDelay +
        ANIMATION_CONFIG.pauseBetweenCommands;

      timeoutRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, phase: 'next' }));
      }, outputDelay);
      return;
    }

    if (state.phase === 'next') {
      const nextIndex = state.currentCommandIndex + 1;
      if (nextIndex >= TERMINAL_COMMANDS.length) {
        setState((prev) => ({
          ...prev,
          phase: 'complete',
          completedCommands: [
            ...prev.completedCommands,
            prev.currentCommandIndex,
          ],
          showReplayButton: true,
        }));
        onComplete?.();
      } else {
        setState((prev) => ({
          ...prev,
          phase: 'typing',
          completedCommands: [
            ...prev.completedCommands,
            prev.currentCommandIndex,
          ],
          currentCommandIndex: nextIndex,
          currentCharIndex: 0,
        }));
      }
      return;
    }

    return () => {
      clearTimer();
    };
  }, [
    state.phase,
    state.currentCommandIndex,
    state.currentCharIndex,
    state.currentStepIndex,
    state.isPaused,
    autoPlay,
    prefersReducedMotion,
    clearTimer,
    onComplete,
  ]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  const currentCommand = TERMINAL_COMMANDS[state.currentCommandIndex];
  const typedCommand = currentCommand
    ? currentCommand.command.slice(0, state.currentCharIndex)
    : '';

  const showCursor =
    state.phase === 'typing' ||
    state.phase === 'waiting' ||
    state.phase === 'enter-flash';
  const showSpinner = state.phase === 'spinner';
  const showOutput = state.phase === 'output' || state.phase === 'next';
  const isEnterFlash = state.phase === 'enter-flash';

  // Calculate staggered delay based on line content
  const getOutputDelay = (lineIndex: number, line: string): number => {
    const baseDelay = lineIndex * 0.08;
    const lengthFactor = line.length > 40 ? 0.03 : 0;
    const importantLinePause =
      line.includes('http') || line.includes('✓') ? 0.05 : 0;
    return baseDelay + lengthFactor + importantLinePause;
  };

  // Style output lines based on content
  const getLineStyle = (line: string): React.CSSProperties => {
    if (line.startsWith('✓')) {
      return { color: 'oklch(0.72 0.17 145)' }; // Green for success
    }
    if (line.startsWith('→') || line.includes('http')) {
      return { color: 'oklch(0.7 0.15 250)' }; // Blue for links
    }
    if (
      line.includes('┌') ||
      line.includes('├') ||
      line.includes('└') ||
      line.includes('│')
    ) {
      return { color: 'oklch(0.65 0.05 250)', opacity: 0.9 }; // Subtle for table borders
    }
    return {};
  };

  return (
    <>
      <style>{`
        @keyframes cursor-blink {
          0%, 70% { opacity: 1; }
          71%, 100% { opacity: 0; }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .terminal-cursor {
          animation: cursor-blink 1s infinite;
        }
        .terminal-glow {
          animation: glow-pulse 3s ease-in-out infinite;
        }
      `}</style>
      <motion.div
        initial={
          prefersReducedMotion
            ? { opacity: 1, scale: 1 }
            : { opacity: 0, scale: 0.96, y: 10 }
        }
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.5,
          ease: [0.16, 1, 0.3, 1],
        }}
        className={cn(
          'relative flex w-full flex-col overflow-hidden rounded-xl',
          'border border-zinc-200 dark:border-zinc-800',
          'bg-card',
          'shadow-xl shadow-zinc-200/50 dark:shadow-zinc-950/50',
          'h-[380px] md:h-[420px]',
          className
        )}
      >
        {/* Scanline effect overlay */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.02]">
          <div
            className="absolute inset-x-0 h-px bg-white"
            style={{
              animation: 'scanline 8s linear infinite',
            }}
          />
        </div>

        {/* Terminal header */}
        <div className="relative flex h-11 shrink-0 items-center justify-between border-b border-zinc-200 bg-zinc-100/80 px-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="h-3 w-3 rounded-full bg-[#ff5f56] shadow-sm shadow-red-500/30"
            />
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="h-3 w-3 rounded-full bg-[#ffbd2e] shadow-sm shadow-yellow-500/30"
            />
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="h-3 w-3 rounded-full bg-[#27c93f] shadow-sm shadow-green-500/30"
            />
          </div>

          <div className="absolute left-1/2 -translate-x-1/2">
            <span className="font-mono text-xs font-medium text-zinc-500 dark:text-zinc-400">
              pushdash — zsh
            </span>
          </div>

          <div className="flex items-center gap-1">
            {!prefersReducedMotion && state.phase !== 'complete' && (
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePause();
                }}
                className="h-7 w-7 cursor-pointer text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                aria-label={
                  state.isPaused ? 'Resume animation' : 'Pause animation'
                }
              >
                {state.isPaused ? (
                  <Play className="h-3.5 w-3.5" />
                ) : (
                  <Pause className="h-3.5 w-3.5" />
                )}
              </Button>
            )}
            {state.phase === 'complete' && (
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReplay();
                }}
                className="h-7 w-7 cursor-pointer text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                aria-label="Replay animation"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Terminal content */}
        <div className="flex-1 overflow-auto px-4 py-4 font-mono text-[13px] leading-relaxed md:px-5 md:py-5">
          {/* Completed commands */}
          {state.completedCommands.map((cmdIndex) => {
            const cmd = TERMINAL_COMMANDS[cmdIndex];
            return (
              <div key={cmdIndex} className="mb-5">
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    ❯
                  </span>
                  <span className="text-zinc-800 dark:text-zinc-200">
                    {cmd.command}
                  </span>
                </div>
                <div className="space-y-0.5 pl-5">
                  {cmd.output.map((line, lineIndex) => (
                    <div
                      key={lineIndex}
                      className="text-zinc-600 dark:text-zinc-400"
                      style={getLineStyle(line)}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Current command being typed */}
          {currentCommand && state.phase !== 'complete' && (
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  ❯
                </span>
                <span className="text-zinc-800 dark:text-zinc-200">
                  {typedCommand}
                </span>
                {showCursor && !isEnterFlash && (
                  <motion.span
                    initial={{ opacity: 1 }}
                    className="terminal-cursor inline-block h-[18px] w-[9px] rounded-[1px] bg-emerald-500 dark:bg-emerald-400"
                  />
                )}
                {isEnterFlash && (
                  <motion.span
                    initial={{ opacity: 0.6, scale: 1 }}
                    animate={{ opacity: 0, scale: 2 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="inline-block h-5 w-5 rounded-full bg-emerald-400/40"
                  />
                )}
              </div>

              {/* Spinner with intermediate steps */}
              {showSpinner && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex items-center gap-2 pl-5"
                >
                  <span className="text-base text-amber-500 dark:text-amber-400">
                    {SPINNER_FRAMES[state.spinnerFrame]}
                  </span>
                  {currentCommand.intermediateSteps &&
                  state.currentStepIndex <
                    currentCommand.intermediateSteps.length ? (
                    <motion.span
                      key={state.currentStepIndex}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="text-zinc-500 dark:text-zinc-400"
                    >
                      {currentCommand.intermediateSteps[state.currentStepIndex]}
                    </motion.span>
                  ) : (
                    <span className="text-zinc-500 dark:text-zinc-400">
                      Processing...
                    </span>
                  )}
                </motion.div>
              )}

              {/* Output lines */}
              {showOutput && (
                <div className="mt-2 space-y-0.5 pl-5">
                  {currentCommand.output.map((line, lineIndex) => (
                    <motion.div
                      key={lineIndex}
                      initial={{ opacity: 0, y: -4, filter: 'blur(2px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{
                        duration: 0.2,
                        delay: getOutputDelay(lineIndex, line),
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                      className="text-zinc-600 dark:text-zinc-400"
                      style={getLineStyle(line)}
                    >
                      {line}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Final prompt after completion */}
          {state.phase === 'complete' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2"
            >
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                ❯
              </span>
              <motion.span
                initial={{ opacity: 1 }}
                className="terminal-cursor inline-block h-[18px] w-[9px] rounded-[1px] bg-emerald-500 dark:bg-emerald-400"
              />
            </motion.div>
          )}
        </div>

        {/* Gradient fade at bottom */}
        <div className="from-card pointer-events-none absolute right-0 bottom-0 left-0 h-8 bg-linear-to-t to-transparent" />
      </motion.div>
    </>
  );
}
