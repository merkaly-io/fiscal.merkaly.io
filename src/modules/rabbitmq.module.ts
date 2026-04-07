import { Module } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ApiQueue } from 'src/queues/api.queue';

function createClient(queue: string): ClientProxy {
  return ClientProxyFactory.create({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue,
      queueOptions: { durable: true },
    },
  });
}

@Module({
  providers: [{ provide: ApiQueue, useFactory: () => createClient('api_queue') }],
  exports: [ApiQueue],
})
export class RabbitMQModule {}
