import { aggregateByMonth } from '../../lib/chartUtils';
import { mockRejection } from '../helpers/index';

describe('aggregateByMonth', () => {
  it('returns the correct number of months', () => {
    const result = aggregateByMonth([], 6);
    expect(result).toHaveLength(6);
  });

  it('defaults to 6 months', () => {
    const result = aggregateByMonth([]);
    expect(result).toHaveLength(6);
  });

  it('returns all zeros for empty rejections', () => {
    const result = aggregateByMonth([], 6);
    result.forEach((point) => {
      expect(point.count).toBe(0);
    });
  });

  it('counts rejections in the correct month', () => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const rejections = [
      mockRejection({ date: `${currentMonth}-05` }),
      mockRejection({ date: `${currentMonth}-15` }),
      mockRejection({ date: `${currentMonth}-25` }),
    ];

    const result = aggregateByMonth(rejections, 6);
    const lastBucket = result[result.length - 1];
    expect(lastBucket.count).toBe(3);
    expect(lastBucket.key).toBe(currentMonth);
  });

  it('ignores rejections outside the time window', () => {
    const rejections = [
      mockRejection({ date: '2020-01-15' }),
    ];
    const result = aggregateByMonth(rejections, 6);
    result.forEach((point) => {
      expect(point.count).toBe(0);
    });
  });

  it('returns months in chronological order', () => {
    const result = aggregateByMonth([], 6);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].key > result[i - 1].key).toBe(true);
    }
  });

  it('assigns short month labels', () => {
    const result = aggregateByMonth([], 3);
    result.forEach((point) => {
      expect(point.label).toMatch(/^[A-Z][a-z]{2}$/);
    });
  });

  it('distributes rejections across multiple months', () => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

    const rejections = [
      mockRejection({ date: `${thisMonth}-10` }),
      mockRejection({ date: `${lastMonth}-05` }),
      mockRejection({ date: `${lastMonth}-20` }),
    ];

    const result = aggregateByMonth(rejections, 6);
    const lastBucket = result[result.length - 1];
    const secondToLast = result[result.length - 2];
    expect(lastBucket.count).toBe(1);
    expect(secondToLast.count).toBe(2);
  });
});
