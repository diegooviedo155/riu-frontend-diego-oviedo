import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Hero } from '../../models';

@Component({
  selector: 'app-hero-card',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './hero-card.component.html',
  styleUrls: ['./hero-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroCardComponent {
  @Input({ required: true }) hero!: Hero;
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<Hero>();

  onEdit(): void {
    this.edit.emit(this.hero.id);
  }

  onDelete(): void {
    this.delete.emit(this.hero);
  }
}
