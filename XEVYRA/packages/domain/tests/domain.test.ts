import { describe, it, expect } from 'vitest';
import {
  Email,
  User,
  MacroNutrients,
  WorkoutSet,
  WorkoutSession,
  OneRepMaxRecord,
  Result,
  DomainError,
} from '../src/index.js';

describe('Domain Layer: Core Primitives & Invariants', () => {
  describe('Email Value Object', () => {
    it('should create valid email', () => {
      const emailResult = Email.create('user@xevyra.fit');
      expect(emailResult.isSuccess).toBe(true);
      expect(emailResult.getValue().value).toBe('user@xevyra.fit');
    });

    it('should reject invalid email', () => {
      const emailResult = Email.create('invalid-email');
      expect(emailResult.isFailure).toBe(true);
      expect(emailResult.error?.code).toBe('INVALID_EMAIL');
    });
  });

  describe('User Entity', () => {
    it('should enforce required user fields', () => {
      const email = Email.create('test@xevyra.fit').getValue();
      const userResult = User.create({
        id: 'usr_123',
        firebaseUid: 'fb_12345',
        email,
        displayName: 'John Doe',
      });

      expect(userResult.isSuccess).toBe(true);
      const user = userResult.getValue();
      expect(user.displayName).toBe('John Doe');
      expect(user.role).toBe('USER');
      expect(user.isActive).toBe(true);
    });

    it('should allow profile updates', () => {
      const email = Email.create('test@xevyra.fit').getValue();
      const user = User.create({
        id: 'usr_123',
        firebaseUid: 'fb_12345',
        email,
        displayName: 'John Doe',
      }).getValue();

      const updateResult = user.updateProfile('Jane Doe', 'https://avatar.png', 'America/New_York');
      expect(updateResult.isSuccess).toBe(true);
      expect(user.displayName).toBe('Jane Doe');
      expect(user.avatarUrl).toBe('https://avatar.png');
      expect(user.timezone).toBe('America/New_York');
    });
  });

  describe('MacroNutrients Value Object', () => {
    it('should aggregate macros correctly', () => {
      const meal1 = MacroNutrients.create({
        calories: 500,
        proteinGrams: 40,
        carbsGrams: 50,
        fatGrams: 15,
      }).getValue();

      const meal2 = MacroNutrients.create({
        calories: 300,
        proteinGrams: 20,
        carbsGrams: 30,
        fatGrams: 10,
      }).getValue();

      const total = meal1.add(meal2);
      expect(total.calories).toBe(800);
      expect(total.proteinGrams).toBe(60);
      expect(total.carbsGrams).toBe(80);
      expect(total.fatGrams).toBe(25);
    });
  });

  describe('Workout & Strength Calculations', () => {
    it('should calculate 1RM using Brzycki formula accurately', () => {
      // 100kg for 5 reps -> 100 / (1.0278 - 0.0278 * 5) = 100 / 0.8888 = 112.5 kg
      const calculated1RM = OneRepMaxRecord.calculateBrzycki(100, 5);
      expect(calculated1RM).toBe(112.5);
    });

    it('should complete workout session and advance version', () => {
      const session = WorkoutSession.create('sess_1', {
        userId: 'usr_123',
        routineName: 'Push Day A',
        startedAt: new Date(),
        status: 'IN_PROGRESS',
        exercises: [],
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).getValue();

      expect(session.status).toBe('IN_PROGRESS');
      expect(session.version).toBe(1);

      const completeResult = session.completeSession();
      expect(completeResult.isSuccess).toBe(true);
      expect(session.status).toBe('COMPLETED');
      expect(session.version).toBe(2);
      expect(session.endedAt).toBeDefined();
    });
  });
});
