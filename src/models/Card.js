/**
 * Card model representing a Pokemon card obtained from roulettes
 */

export class Card {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.name = data.name || '';
    this.type = data.type || 'normal';
    this.rarity = data.rarity || 'common';
    this.image = data.image || null;
    this.description = data.description || '';
    this.obtainedFrom = data.obtainedFrom || null; // Which roulette it came from
    this.obtainedAt = data.obtainedAt || new Date().toISOString();
    this.used = data.used || false;
    this.usedAt = data.usedAt || null;
  }
  
  generateId() {
    return `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  use() {
    this.used = true;
    this.usedAt = new Date().toISOString();
  }
  
  unuse() {
    this.used = false;
    this.usedAt = null;
  }
  
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      rarity: this.rarity,
      image: this.image,
      description: this.description,
      obtainedFrom: this.obtainedFrom,
      obtainedAt: this.obtainedAt,
      used: this.used,
      usedAt: this.usedAt
    };
  }
  
  static fromJSON(data) {
    return new Card(data);
  }
}

/**
 * Roulette configuration model
 */
export class RouletteConfig {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.name = data.name || '';
    this.description = data.description || '';
    this.segments = data.segments || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.active = data.active !== undefined ? data.active : true;
  }
  
  generateId() {
    return `roulette_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  addSegment(segment) {
    this.segments.push({
      id: `segment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      label: segment.label || '',
      value: segment.value || null,
      weight: segment.weight || 1,
      color: segment.color || '#3498db',
      card: segment.card || null // Card data to generate if this segment is selected
    });
  }
  
  removeSegment(segmentId) {
    this.segments = this.segments.filter(segment => segment.id !== segmentId);
  }
  
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      segments: this.segments,
      createdAt: this.createdAt,
      active: this.active
    };
  }
  
  static fromJSON(data) {
    return new RouletteConfig(data);
  }
}
