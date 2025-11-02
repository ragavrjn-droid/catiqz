import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface WelcomeTourProps {
  onComplete: () => void;
}

const tourSteps = [
  {
    title: 'Welcome to CatIQz! 🎯',
    description:
      'Your AI-powered market intelligence platform. Get real-time catalyst analysis, stock insights, and macro economic updates all in one place.',
    position: 'center',
  },
  {
    title: 'Live Event Feed',
    description:
      'See market-moving events as they happen. AI analyzes each catalyst for impact, sentiment, and affected sectors.',
    position: 'center',
  },
  {
    title: 'Advanced Filtering',
    description:
      'Filter events by impact level, sector, country, or search for specific tickers to focus on what matters to you.',
    position: 'left',
  },
  {
    title: 'Sector Heatmap & Insights',
    description:
      'Track sector performance and top movers at a glance. Quick analyze any stock right from the dashboard.',
    position: 'right',
  },
  {
    title: 'Save & Organize',
    description:
      'Bookmark important events and stocks with notes and tags. Build your personalized research collection.',
    position: 'center',
  },
];

export function WelcomeTour({ onComplete }: WelcomeTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen the tour
    const hasSeenTour = localStorage.getItem('catiqz-tour-completed');
    if (!hasSeenTour) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    localStorage.setItem('catiqz-tour-completed', 'true');
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  const step = tourSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="mb-2">{step.title}</h3>
            <p className="text-muted-foreground">{step.description}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={completeTour}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="flex gap-1">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-primary'
                    : index < currentStep
                    ? 'w-1.5 bg-primary/50'
                    : 'w-1.5 bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            <Button onClick={handleNext}>
              {currentStep === tourSteps.length - 1 ? 'Get Started' : 'Next'}
              {currentStep < tourSteps.length - 1 && (
                <ChevronRight className="w-4 h-4 ml-1" />
              )}
            </Button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={completeTour}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip tour
          </button>
        </div>
      </Card>
    </div>
  );
}
