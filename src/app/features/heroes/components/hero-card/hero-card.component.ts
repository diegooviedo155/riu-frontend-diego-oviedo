import {
  Component,
  input,
  output,
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
  readonly hero = input.required<Hero>();
  readonly edit = output<string>();
  readonly delete = output<Hero>();

  onEdit(): void {
    this.edit.emit(this.hero().id);
  }

  onDelete(): void {
    this.delete.emit(this.hero());
  }
}
