export class StationReservationState {
  constructor(reservedBy = null) { this.reservedBy = reservedBy; }

  reserve(animalId) {
    if (this.reservedBy && this.reservedBy !== animalId) return false;
    this.reservedBy = animalId;
    return true;
  }

  release(animalId) {
    if (this.reservedBy !== animalId) return false;
    this.reservedBy = null;
    return true;
  }

  serialize() { return { reservedBy: this.reservedBy }; }
}
