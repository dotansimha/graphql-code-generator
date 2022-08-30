import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs';
import { Observable } from 'rxjs';
import { AllFilmsWithVariablesQueryQuery } from 'src/gql/graphql';
import { Films } from './films.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  data: Observable<AllFilmsWithVariablesQueryQuery> | undefined;

  // inject it
  constructor(private filmsGQL: Films) {}

  ngOnInit() {
    // use it!
    this.data = this.filmsGQL.watch({ first: 10 }).valueChanges.pipe(map(result => result.data));
  }
}
