import { cellKey, cloneSerializable, footprintCells } from './GridCells.js';

const makeKeySet = (cells = []) => new Set(cells.map((cell) => cellKey(cell)));

export class EnclosureState {
  constructor(definition) {
    this.listeners = new Set();
    this.definition = cloneSerializable(definition);
    this.revision = 0;
    this.refresh(false);
  }

  refresh(notify = true) {
    this.interior = makeKeySet(this.definition.interiorCells);
    this.fences = makeKeySet(this.definition.boundaryCells);
    this.gates = makeKeySet(this.definition.gateCells);
    this.navigation = makeKeySet(this.definition.animalNavigationCells ?? this.definition.interiorCells);
    this.reserved = makeKeySet([
      ...(this.definition.reservedCells ?? []),
      ...(this.definition.requiredGateClearanceCells ?? []),
    ]);
    this.occupied = new Map();
    this.definition.installedObjects.forEach((object) => {
      footprintCells(object).forEach((cell) => this.occupied.set(cellKey(cell), object.instanceId));
    });
    this.revision += 1;
    if (notify) this.listeners.forEach((listener) => listener(this));
    return this;
  }

  onChange(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  mutate(mutator) {
    mutator(this.definition);
    return this.refresh(true);
  }

  isInterior(cell) { return this.interior.has(cellKey(cell)); }
  isFence(cell) { return this.fences.has(cellKey(cell)); }
  isGate(cell) { return this.gates.has(cellKey(cell)); }
  isOccupied(cell) { return this.occupied.has(cellKey(cell)); }
  isReserved(cell) { return this.reserved.has(cellKey(cell)); }

  getObjectAt(cell) {
    const instanceId = this.occupied.get(cellKey(cell));
    return this.definition.installedObjects.find((object) => object.instanceId === instanceId) ?? null;
  }

  isAnimalWalkable(cell) {
    if (!this.navigation.has(cellKey(cell)) || this.isFence(cell)) return false;
    const object = this.getObjectAt(cell);
    return !object || object.walkable;
  }

  getAnimalWalkableCells() {
    return (this.definition.animalNavigationCells ?? this.definition.interiorCells)
      .filter((cell) => this.isAnimalWalkable(cell))
      .map((cell) => [...cell]);
  }

  getPlacementCells() {
    return this.definition.interiorCells.filter((cell) => (
      !this.isFence(cell)
      && !this.isGate(cell)
      && !this.isReserved(cell)
      && !this.isOccupied(cell)
    ));
  }

  canPlaceObject(object) {
    const cells = footprintCells(object);
    const reason = cells.some((cell) => !this.isInterior(cell)) ? 'outside-enclosure'
      : cells.some((cell) => this.isFence(cell)) ? 'fence-cell'
        : cells.some((cell) => this.isGate(cell) || this.isReserved(cell)) ? 'required-gate-clearance'
          : cells.some((cell) => this.isOccupied(cell)) ? 'occupied-cell'
            : null;
    return { allowed: reason === null, reason, cells };
  }

  getCapacityForSpecies(speciesId) {
    if (!this.definition.allowedSpecies.includes(speciesId)) return 0;
    const capacity = this.definition.capacity;
    if (capacity.mode === 'manual') return capacity.current;
    const cellsPerAnimal = capacity.minimumUsableFloorCellsPerAnimalBySpecies[speciesId];
    if (!cellsPerAnimal) return 0;
    return Math.floor(this.getAnimalWalkableCells().length / cellsPerAnimal);
  }

  serialize() { return cloneSerializable(this.definition); }

  static restore(serializedDefinition) {
    return new EnclosureState(typeof serializedDefinition === 'string'
      ? JSON.parse(serializedDefinition)
      : serializedDefinition);
  }
}

export class EnclosureRegistry {
  constructor(definitions) {
    this.states = new Map(definitions.map((definition) => [definition.id, new EnclosureState(definition)]));
    this.listeners = new Set();
    this.unsubscribe = [...this.states.values()].map((state) => state.onChange((changed) => {
      this.listeners.forEach((listener) => listener(changed));
    }));
  }

  get(enclosureId) { return this.states.get(enclosureId) ?? null; }
  forMap(mapId) { return [...this.states.values()].filter(({ definition }) => definition.mapId === mapId); }
  onChange(listener) { this.listeners.add(listener); return () => this.listeners.delete(listener); }
  serialize() { return [...this.states.values()].map((state) => state.serialize()); }

  restore(serializedDefinitions) {
    this.unsubscribe.forEach((unsubscribe) => unsubscribe());
    const definitions = typeof serializedDefinitions === 'string'
      ? JSON.parse(serializedDefinitions)
      : serializedDefinitions;
    this.states = new Map(definitions.map((definition) => [definition.id, EnclosureState.restore(definition)]));
    this.unsubscribe = [...this.states.values()].map((state) => state.onChange((changed) => {
      this.listeners.forEach((listener) => listener(changed));
    }));
    this.listeners.forEach((listener) => listener(null));
    return this;
  }
}
