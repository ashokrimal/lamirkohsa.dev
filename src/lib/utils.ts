import React from 'react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Error handling utilities
export class AppError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function handleError(error: unknown): { message: string; statusCode: number } {
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
    };
  }
  
  if (error instanceof Error) {
    console.error('Unexpected error:', error);
    return {
      message: 'An unexpected error occurred',
      statusCode: 500,
    };
  }
  
  return {
    message: 'Something went wrong',
    statusCode: 500,
  };
}

// Loading state utilities
export function createSkeletonArray(length: number, Component: React.ComponentType<any>, props: any = {}) {
  return Array.from({ length }).map((_, index) => {
    return React.createElement(Component, {
      key: index,
      ...props
    });
  });
}

// Delay utility for testing loading states
export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
