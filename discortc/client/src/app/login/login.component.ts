import { Component, OnInit } from '@angular/core';
import {ChatDataService} from "../chat-data.service";
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(
    public chatDataService: ChatDataService,
    private router: Router,
    private route: ActivatedRoute
    ) { }

  ngOnInit() {
  }

  public enter(){
    this.router.navigate(['main'], {}).catch(console.log);
  }

  public validateName(name: string): boolean {
    return /^\w{4,}$/g.test(name);
  }

}
