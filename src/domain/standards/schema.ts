import { z } from 'zod';

const rankSchema = z.enum([
  'YOUTH_3',
  'YOUTH_2',
  'YOUTH_1',
  'ADULT_3',
  'ADULT_2',
  'ADULT_1',
  'CMS',
  'MS',
  'MSMK',
]);

export const standardRowSchema = z.object({
  pool: z.enum(['LCM', 'SCM']),
  sex: z.enum(['M', 'F']),
  stroke: z.enum(['FREE', 'BACK', 'BREAST', 'FLY', 'MEDLEY']),
  distance: z.union([
    z.literal(50),
    z.literal(100),
    z.literal(200),
    z.literal(400),
    z.literal(800),
    z.literal(1500),
  ]),
  // partialRecord, not record: a rank the order leaves blank has no key at all.
  times: z.partialRecord(rankSchema, z.number().positive().max(3600)),
});

export const editionSchema = z.object({
  id: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  order: z.string().min(10),
  effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  effectiveTo: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  rows: z.array(standardRowSchema).min(1),
});
