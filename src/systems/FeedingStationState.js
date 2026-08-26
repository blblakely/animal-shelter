export class FeedingStationState {
  constructor() {
    this.status = 'empty';
    this.foodId = null;
    this.reservedBy = null;
  }

  get isFilled() { return this.status === 'filled'; }

  fill(foodId) {
    if (this.isFilled) return false;
    this.status = 'filled';
    this.foodId = foodId;
    return true;
  }

  reserve(animalId) {
    if (!this.isFilled || (this.reservedBy && this.reservedBy !== animalId)) return false;
    this.reservedBy = animalId;
    return true;
  }

  release(animalId) {
    if (this.reservedBy !== animalId) return false;
    this.reservedBy = null;
    return true;
  }

  consume(animalId) {
    if (!this.isFilled || this.reservedBy !== animalId) return null;
    const foodId = this.foodId;
    this.status = 'empty';
    this.foodId = null;
    this.reservedBy = null;
    return foodId;
  }
}
