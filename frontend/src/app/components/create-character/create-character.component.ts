import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, FormArray, ReactiveFormsModule, Validators, FormsModule, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { CreateCharacterService } from '../../services/create-character.service';
import { DND_Class } from '../../models/dnd_class.type';
import { DND_Race } from '../../models/dnd_race.type';
import { Class_Proficiency_Option } from '../../models/class_proficiency_option.type';
import { Proficiency } from '../../models/proficiency.type';
import { DND_Spell } from '../../models/dnd_spell.type';
import { User_Spell } from '../../models/user_spell.type';
import { MatSnackBar, MatSnackBarModule, MatSnackBarConfig } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { SpellDisplayComponent } from "../spell-display/spell-display.component";
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URL } from '../../constants';


@Component({
  selector: 'app-create-character',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, MatSnackBarModule, SpellDisplayComponent],
  templateUrl: './create-character.component.html',
  styleUrl: './create-character.component.css'
})
export class CreateCharacterComponent implements OnInit {
  characterForm: FormGroup; // Changed Initalization of form group
  createCharacterService = inject(CreateCharacterService)
  authService = inject(AuthService)
  currentUserID: number | null = null;

  //Data Retrieved From Backend
  dndRaces = signal<Array<DND_Race>>([])
  dndClassesSignal = signal<Array<DND_Class>>([])
  classProficiencyOptions = signal<Array<Class_Proficiency_Option>>([])
  dndSpellsSignal = signal<Array<DND_Spell>>([])
  userSpellsSignal = signal<Array<User_Spell>>([])
  userSavedSpellSignal = signal<Array<number>>([])

  //Class Selection Variables
  minLevel = 0
  maxLevel: number[] = []
  totalLevelsDisplay = 0
  chosenClasses: number[] = []


  //Class Proficiency Variables
  selectionValue: number = 0


  //Attribute variables
  attrRulesHiddenArray = [false, true, true, true]
  rolledStats: number[] = []
  standardArray = [15, 14, 13, 12, 10, 8]
  pointBuyCostTable = new Map<number, number>([
    [8, 0],
    [9, 1],
    [10, 2],
    [11, 3],
    [12, 4],
    [13, 5],
    [14, 7],
    [15, 9],
  ]);
  spentPoints = 0
  maxBuyStatArray = [15, 15, 15, 15, 15, 15]


  spellsKnownArray: Array<number> = []
  homebrewSpellsKnownArray: Array<number> = []
  

  hiddenArray = [false, true, true, true, true, true, true, true]
  // Cosntructor changed to initalized formGroup
  constructor(private fb: FormBuilder, private snackbar: MatSnackBar, private router: Router, private http: HttpClient) {

    // Initialize the form with a FormArray for class levels
    this.characterForm = this.fb.group({
      //Basic Info form elements
      name: this.fb.control(null, {validators: [Validators.required]}),
      ruleset: this.fb.control("2014", {validators: [Validators.required]}),
      levelMethod: this.fb.control("experience", {validators: [Validators.required]}),
      encumberance: this.fb.control("false", {validators: [Validators.required]}),

      //Race selection form elements
      race: this.fb.control(null, {validators: [Validators.required]}),

      //class selection form elements
      classLevels: this.fb.array([], {validators: []}), // FormArray to store class levels
      primaryClass: this.fb.control("None", {validators: [Validators.required, validatorNotNone()]}),

      //class proficiency form elements
      classProficiencies: this.fb.array([], {validators: []}),

      //stat allocation form elements
      statRuleset: this.fb.control("roll", {validators: []}),
      rollDiceAmt: this.fb.control(4, {validators: []}),
      rollDiceType: this.fb.control(6, {validators: []}),
      rollDropAmt: this.fb.control(1, {validators: []}),
      str: this.fb.control(8, {validators: []}),
      dex: this.fb.control(8, {validators: []}),
      con: this.fb.control(8, {validators: []}),
      int: this.fb.control(8, {validators: []}),
      wis: this.fb.control(8, {validators: []}),
      cha: this.fb.control(8, {validators: []}),

      //spell selection form elements
      spellsKnown: this.fb.control(this.spellsKnownArray, {validators: []}),
      homebrewSpellsKnown: this.fb.control(this.homebrewSpellsKnownArray, {validators: []}),

      //Character details form elements
      background: this.fb.control("", {validators: []}),
      alignment: this.fb.control("", {validators: []}),
      personality: this.fb.control("", {validators: []}),
      faith: this.fb.control("", {validators: []}),
      height: this.fb.control("", {validators: []}),
      weight: this.fb.control("", {validators: []}),
      skinColor: this.fb.control("", {validators: []}),
      hairColor: this.fb.control("", {validators: []}),
      eyeColor: this.fb.control("", {validators: []}),
      age: this.fb.control("", {validators: []}),
      appearance: this.fb.control("", {validators: []}),
      backstory: this.fb.control("", {validators: []}),
      bonds: this.fb.control("", {validators: []}),
      miscDetails: this.fb.control("", {validators: []}),

      //Equipment details form elements, subject to change
      equipment: this.fb.control("", {validators: []})
      
    });
  }

  //Getters and setters
  get name(): string {
    return this.characterForm.get('name')?.value;
  }

  get ruleset(): string {
    return this.characterForm.get('ruleset')?.value;
  }

  get levelMethod(): string {
    return this.characterForm.get('levelMethod')?.value;
  }

  get encumberance(): string {
    return this.characterForm.get('encumberance')?.value;
  }

  get race(): number {
    return this.characterForm.get('race')?.value;
  }

  get classLevels(): FormArray {
    return this.characterForm.get('classLevels') as FormArray;
  }

  get primaryClass(): string {
    return this.characterForm.get('primaryClass')?.value;
  }

  get classProficiencies(): FormArray {
    return this.characterForm.get('classProficiencies') as FormArray
  }

  get statRuleset(): string {
    return this.characterForm.get('statRuleset')?.value
  }

  get rollDiceAmt(): number {
    return this.characterForm.get('rollDiceAmt')?.value
  }

  get rollDiceType(): number {
    return this.characterForm.get('rollDiceType')?.value
  }

  get rollDropAmt(): number {
    return this.characterForm.get('rollDropAmt')?.value
  }

  get statArray(): FormArray {
    return this.characterForm.get('statArray') as FormArray
  }

  get str(): number {
    return this.characterForm.get('str')?.value
  }

  get dex(): number {
    return this.characterForm.get('dex')?.value
  }

  get con (): number {
    return this.characterForm.get('con')?.value
  }

  get int(): number {
    return this.characterForm.get('int')?.value
  }

  get wis(): number {
    return this.characterForm.get('wis')?.value
  }

  get cha(): number {
    return this.characterForm.get('cha')?.value
  }

  // set classProficiencies(arr: FormArray) {
  //   this.characterForm.get('classProficiencies')?.setValue(arr)
  // }

  set primaryClass(str: string) {
    this.characterForm.get('primaryClass')?.setValue(str)
  }

  set rollDiceAmt(num: number) {
    this.characterForm.get('rollDiceAmt')?.setValue(num)
  }

  set rollDiceType(num: number) {
    this.characterForm.get('rollDiceType')?.setValue(num)
  }

  set rollDropAmt(num: number) {
    this.characterForm.get('rollDropAmt')?.setValue(num)
  }

  set str(num: number) {
    this.characterForm.get("str")?.setValue(num)
  }

  set dex(num: number) {
    this.characterForm.get('dex')?.setValue(num)
  }

  set con (num: number) {
    this.characterForm.get('con')?.setValue(num)
  }

  set int(num: number) {
    this.characterForm.get('int')?.setValue(num)
  }

  set wis(num: number){
    this.characterForm.get('wis')?.setValue(num)
  }

  set cha(num: number) {
    this.characterForm.get('cha')?.setValue(num)
  }


  //Class Selection Methods
  initializeClassLevels(classes: DND_Class[]): void {
    classes.forEach(() => {
      this.classLevels.push(this.fb.control(0, Validators.min(this.minLevel)));
    });
  }

  getClassLevels(): { class_id: number, level: number }[] {
    return this.dndClassesSignal().map((dndClass, index) => ({
      class_id: dndClass.class_id,
      level: this.classLevels.at(index).value ?? 0
    }));
  }

  updateMaxLevels() {
    let totalLevels = 0
    this.classLevels.controls.forEach(dndClass => {
      totalLevels += dndClass.value
    })
    this.totalLevelsDisplay = totalLevels
    for (let i in this.maxLevel) {
      this.maxLevel[i] = this.classLevels.at(parseInt(i)).value + (20 - totalLevels)
    }
    this.chosenClasses = []
    for(let dndClass of this.getClassLevels()) {
      if(dndClass.level != 0) {
        this.chosenClasses.push(dndClass.class_id)
      }
    }
  }

  getClassString() {
    let levelArray = this.getClassLevels()
    let finalString = ""
    let nonPrimaryClassString = ""
    let numOfClasses = 0
    for(let dndClass of levelArray) {
      if(dndClass.level > 0) {
        numOfClasses++;
      }
    }
    if(this.primaryClass != "None") {
      for(let dndClass of levelArray) { //initial search for primary class
        if(dndClass.class_id.toString() == this.primaryClass) {
          finalString += `${this.dndClassesSignal()[dndClass.class_id-1].name} Lvl. ${dndClass.level}`
        } else if(dndClass.level > 0) {
          nonPrimaryClassString += `, ${this.dndClassesSignal()[dndClass.class_id-1].name} Lvl. ${dndClass.level}`
        }
      } 
    } else {
      for(let dndClass of levelArray) { //initial search for primary class
        if(dndClass.level > 0) {
          nonPrimaryClassString += `${this.dndClassesSignal()[dndClass.class_id-1].name} Lvl. ${dndClass.level}${numOfClasses > 1 ? ", " : ""}`
          numOfClasses--;
        }
      }
    }
    return finalString + nonPrimaryClassString
  }

  //Class Proficiency Methods
  getArrayOfProfTypes(dndClass: string): Class_Proficiency_Option[] {
    let classNum = parseInt(dndClass)
    let result: Class_Proficiency_Option[] = []
    for(let classProf of this.classProficiencyOptions()) {
      if(classProf.class_id == classNum) {
        result.push(classProf)
      }
    }
    return result
  }

  getArrayofProfOptions(dndClass: string): Proficiency[][] {
    let profTypes = this.getArrayOfProfTypes(dndClass)
    let result: Proficiency[][] = []
    profTypes.forEach((profOption, upperIndex) => {
      result.push([])
      profOption.proficiency_options.forEach((option, index) => {
        result[upperIndex].push(option)
      })
    })
    return result
  }

  getProfFirstOption(dndClass: string, index: number): number {
    let profTypes = this.getArrayOfProfTypes(dndClass)
    return profTypes[index].proficiency_options[0].id
  }

  initializeClassProficiencies(dndClass: string): void {
    this.characterForm.setControl('classProficiencies', this.fb.array([]));
  
    if (dndClass === "None") {
      return;
    }
  
    const profTypes = this.getArrayOfProfTypes(dndClass);
  
    profTypes.forEach((profOption) => {
      const proficiencyGroup = this.fb.group({
        list_desc: profOption.list_description,
        selects: this.initializeProfOptions(profOption)
      });
      (this.characterForm.get('classProficiencies') as FormArray).push(proficiencyGroup);
    });
  }

  initializeProfOptions(x: Class_Proficiency_Option) {
    let arr = new FormArray<FormGroup>([])
    for(let i = 0; i < x.max_choices; i++) {
      arr.push(this.fb.group({
        prof_list: new FormControl(x.proficiency_options),
        option: "None"
      }))
    }
    return arr
  }

  getProfOptions() {
    let result: Array<string> = []
    let classProfs = this.characterForm.get("classProficiencies")?.value
    classProfs.forEach((element: {list_desc: string, selects: [{prof_list: Proficiency[], option: string}]}) => {
      element.selects.forEach((element: {prof_list: Proficiency[], option: string}) => {
        result.push(element.option)
      })
    });
    return result
  }



  //Attribute methods
  showAttributeRuleset(rulesID: string) {
    this.str = 8;
    this.dex = 8;
    this.con = 8;
    this.int = 8;
    this.wis = 8;
    this.cha = 8;
    switch(rulesID) {
      case "roll": {
        this.attrRulesHiddenArray = [false, true, true, true]
        break
      }
      case "standard_array": {
        this.attrRulesHiddenArray = [true, false, true, true]
        break
      }
      case "point_buy": {
        this.attrRulesHiddenArray = [true, true, false, true]
        break
      }
      case "manual": {
        this.attrRulesHiddenArray = [true, true, true, false]
        break
      }
    }
  }

  getRandomValueBetween(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  rollStats() {
    let result: number[] = []
    
    for(let i = 0; i < 6; i++) {
      let randInts: number[] = []
      let total = 0
      for(let j = 0; j < this.rollDiceAmt; j++) {
        randInts.push(this.getRandomValueBetween(1, this.rollDiceType))
      }
      for(let j = 0; j < this.rollDropAmt; j++) {
        let indexOfLowest = randInts.indexOf(Math.min(...randInts))
        randInts.splice(indexOfLowest, 1)
      }
      for(let num of randInts) {
        total += num
      }
      result.push(total)
    }
    this.rolledStats = result.sort(function (a, b) {  return a - b;  }).reverse()
  }

  rollDiceReset() {
    this.rollDiceAmt = 4
    this.rollDiceType = 6
    this.rollDropAmt = 1
  }

  getNewMaxBuyStat(stat: number, points: number) {
    let maxStat = stat
    while(maxStat < 13 && points > 0) {
      maxStat++;
      points--;
    }
    while(maxStat < 15 && points >= 2) {
      maxStat++;
      points -= 2;
    }
    return maxStat
  }

  updateMaxStats(allStats: number[]) {
    let totalCost = 0
    for(let stat of allStats) {
      totalCost += this.pointBuyCostTable.get(stat) ?? 0;
    }
    this.spentPoints = totalCost
    for(let i = 0; i < 6; i++) {
      this.maxBuyStatArray[i] = this.getNewMaxBuyStat(allStats[i], (27-this.spentPoints))
    }
  }

  getStatArray(): any[] {
    return [this.str, this.dex, this.con, this.int, this.wis, this.cha]
  }

  //Spell methods

  addToSpellList(inputArray: Array<number>, inputID: number) {
    console.log(inputID)
    if(!inputArray.includes(inputID)) {
      inputArray.push(inputID)
    }
  }

  removeFromSpellList(inputArray: Array<number>, inputID: number) {
    let indexToRemove = inputArray.indexOf(inputID)
    inputArray.splice(indexToRemove, 1)
  }

  getSpellList() {
    let output = []
    for(let i = 0; i < this.spellsKnownArray.length; i++) {
      output.push(this.dndSpellsSignal()[this.spellsKnownArray[i] - 1])
    }
    return output
  }

  getHomebrewSpellList() {
    let output = []
    for(let spell of this.userSpellsSignal()) {
      if(this.homebrewSpellsKnownArray.includes(spell.user_spell_id)) {
        output.push(spell)
      }
    }
    return output
  }

  getUserSavedHomebrewSpellList() {
    const user = this.authService.getCurrentUser();
    if (!user) {
      console.warn('User not loaded yet');
      return;
    }

    const params = new HttpParams().set('userID', user.id);

    this.http.get(`${API_URL}saved-homebrew-ids`, { params }).subscribe((res: any) => {
      const savedList = res.saved as { content_type: string, content_id: number }[];

      const savedIds = savedList
        .filter(item => item.content_type === "spell")
        .map(item => item.content_id);
      
      
      this.userSavedSpellSignal.set(savedIds)
    });
  }




  //Miscellaneous Methods

  validateClassLevels() {
    let total = 0
    for(let level of this.classLevels.value) {
      total += level
    }
    if(total > 20 || total <= 0) {
      return false
    }
    return true
  }

  validateClassProfsNone(): boolean {
    let profOptions = this.getProfOptions()
    for(let option of profOptions) {
      if(option == "None") {
        return false
      }
    }
    return true
  }

  validateClassProfsRepeat() {
    let profOptions = this.getProfOptions()
    return !(new Set(profOptions).size != profOptions.length)
  }

  validateStats(): number {
    if(this.statRuleset == "roll") {
      if(this.rolledStats.length == 0) {
        return 1
      }
      let tempStatArray: number[] = []
      this.rolledStats.forEach(element => tempStatArray.push(element))
      for(let stat of this.getStatArray()) {
        if(tempStatArray.includes(parseInt(stat))) {
          let i = tempStatArray.findIndex(element => element === parseInt(stat))
          tempStatArray.splice(i, 1)
        } else {
          return 2
        }
      }
    } else if(this.statRuleset == "standard_array") {
      let tempStatArray = [15, 14, 13, 12, 10, 8]
      for(let stat of this.getStatArray()) {
        if(tempStatArray.includes(parseInt(stat))) {
          let i = tempStatArray.findIndex(element => element === parseInt(stat))
          tempStatArray.splice(i, 1)
        } else {
          return 2
        }
      }
    } else if(this.statRuleset == "point_buy") {
      if(this.spentPoints != 27) {
        return 3
      }
    } else if(this.statRuleset == "manual") {
      for(let stat of this.getStatArray()) {
        if(parseInt(stat) > 20) {
          return 4
        }
      }
    }
    return 0
  }


  calculateStatModifier(stat: number): string {
    let modifier = Math.floor((stat - 10) / 2)
    if(modifier >= 0) {
      return `+${modifier}`
    } else {
      return `${modifier}`
    }
  }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.id) {
      this.currentUserID = currentUser.id; 
    } else {
      console.error('No user is logged in for Character.');
      // alert('You must be logged in to create a character.');
      this.router.navigate(['/login']); 
    }
    this.createCharacterService.getRaceData().subscribe((races) => {
      this.dndRaces.set(races)
    })
    this.createCharacterService.getClassData().subscribe((classes) => {
      this.dndClassesSignal.set(classes)
      this.initializeClassLevels(classes); // Initialize the FormArray with class levels
      this.dndClassesSignal().forEach(() => {
        this.maxLevel.push(20)
      })
    })

    this.createCharacterService.getClassProficiencyData().subscribe((options) => {
      this.classProficiencyOptions.set(options)
    })

    this.createCharacterService.getSpellData().subscribe((spells) => {
      this.dndSpellsSignal.set(spells)
    })

    // this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
    //   if (isLoggedIn && this.authService.getCurrentUser()) {
        
    //   }
    // });
    this.createCharacterService.getUserSpellData().subscribe((userSpells) => {
      this.userSpellsSignal.set(userSpells)
    })
    this.getUserSavedHomebrewSpellList()
  }
  
  public showTab(tabId: string) {
    switch(tabId) {
      case "basicInfo": {
        this.hiddenArray = [false, true, true, true, true, true, true, true]
        break;
      }
      case "race": {
        this.hiddenArray = [true, false, true, true, true, true, true, true]
        break; 
      }
      case "class": {
        this.hiddenArray = [true, true, false, true, true, true, true, true];
        break;
      }
      case "class_proficiencies": {
        this.hiddenArray = [true, true, true, false, true, true, true, true]
        break;
      }
      case "attributes": {
        this.hiddenArray = [true, true, true, true, false, true, true, true]
        break;
      }
      case "spells": {
        this.hiddenArray = [true, true, true, true, true, false, true, true]
        break;
      }
      case "details": {
        this.hiddenArray = [true, true, true, true, true, true, false, true]
        break;
      }
      case "equipment": {
        this.hiddenArray = [true, true, true, true, true, true, true, false]
        break;
      }
    }
    
  }

  

  onSubmit() {
    if(!this.characterForm.get("name")?.valid) {
      this.snackbar.open("ERROR: Your character needs a name!", "", {panelClass : 'error-notif', duration: 5000})
    } else if(!this.characterForm.get("race")?.valid) {
      this.snackbar.open("ERROR: Your character needs a race!", "", {panelClass : 'error-notif', duration: 5000})
    } else if(!this.characterForm.get("primaryClass")?.valid) {
      this.snackbar.open("ERROR: Your character needs a primary class!", "", {panelClass : 'error-notif', duration: 5000})
    } else if(!this.validateClassLevels()) {
      this.snackbar.open("ERROR: Your level selection is invalid!", "", {panelClass : 'error-notif', duration: 5000})
    } else if(!this.validateClassProfsNone()) {
      this.snackbar.open("ERROR: Class proficiencies left unselected!", "", {panelClass : 'error-notif', duration: 5000})
    } else if(!this.validateClassProfsRepeat()) {
      this.snackbar.open("ERROR: Class proficiencies cannot be repeated!", "", {panelClass : 'error-notif', duration: 5000})
    } else if(this.validateStats() == 1) {
      this.snackbar.open("ERROR: Stats not rolled!", "", {panelClass : 'error-notif', duration: 5000})
    } else if(this.validateStats() == 2) {
      this.snackbar.open("ERROR: Invalid stat choice!", "", {panelClass : 'error-notif', duration: 5000})
    } else if(this.validateStats() == 3) {
      this.snackbar.open("ERROR: Unspent points!", "", {panelClass : 'error-notif', duration: 5000})
    } else if(this.validateStats() == 4) {
      this.snackbar.open("ERROR: Stats exceeding max!", "", {panelClass : 'error-notif', duration: 5000})
    } else {
      console.log(this.classProficiencies.value)
      const formData = this.characterForm.value;
      console.log('Form Data:', formData); 
      formData.user_id = this.currentUserID;
      this.createCharacterService.createCharacter(formData).subscribe({
        next: (response: any) => {
          console.log('Character created successfully!', response);
          this.snackbar.open("Character created successfully!", "", {panelClass : 'success-notif', duration: 5000})
          this.router.navigate(['/home']);
        },
        error: (error: any) => {
          console.error('Error creating character:', error);
          this.snackbar.open("ERROR: Could not create character!", "", {panelClass : 'error-notif', duration: 5000})
        }
      });
    }
  }
}

export function validatorNotNone(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value
    return (value == "None") ? {isNone:true} : null;
  }
}