import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';

describe('AppModule', () => {
  it('should be defined', async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    expect(module).toBeDefined();
  });
});
