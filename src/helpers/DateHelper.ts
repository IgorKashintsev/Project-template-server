export abstract class DateHelper {
  public static calculateDifferenceInDays(startDate: Date, endDate: Date) {
    const diffTime = endDate.getTime() - startDate.getTime();

    if (diffTime <= 0) {
      throw new Error(`End date must be greater than start date.`);
    }

    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  public static generateDateRange(from: Date, to: Date): Date[] {
    const dates: Date[] = [];
    const differenceInDays = DateHelper.calculateDifferenceInDays(from, to);
    
    dates.push(new Date(from.getFullYear(), from.getMonth(), from.getDate()));
    for (let i = 1; i <= differenceInDays; i++) {
      dates.push(new Date(from.getFullYear(), from.getMonth(), from.getDate() + i));
    }

    return dates;
  }

  public static resetTimeInDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}
