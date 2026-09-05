import type { Metadata } from 'next';
import { Calculator } from '@/features/calculator/Calculator';
import { calculatorMetadata } from '@/lib/seo';

export const metadata: Metadata = calculatorMetadata;

export default function CalculatorPage() {
  return <Calculator />;
}
