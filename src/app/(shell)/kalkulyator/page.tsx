import type { Metadata } from 'next';
import { ForwardToApp } from '@/features/app/ForwardToApp';
import { calculatorMetadata } from '@/lib/seo';

export const metadata: Metadata = calculatorMetadata;

/**
 * The address the calculator had while it was a page of its own. The app is one page now,
 * so this one only hands the reader over to it; the links to it out in the world and in
 * the index are the reason it is still written at all.
 */
export default function CalculatorPage() {
  return <ForwardToApp mode="calculator" />;
}
