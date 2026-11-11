import { Worker } from 'bullmq';
import { transporter } from './email.js';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

export const emailWorker = new Worker(
  'email',
  async (job) => {
    if (job.name === 'otp') {
      await transporter.sendMail({
        to: job.data.to,
        subject: 'Your Verification Code',
        text: `Your OTP is ${job.data.otp}`,
      });
    }
  },
  {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    },
  }
);