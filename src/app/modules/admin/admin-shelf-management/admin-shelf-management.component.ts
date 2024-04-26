import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Shelf } from '../../../shared/dto/shelf';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { ShelfService } from '../../../shared/service/shelf.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { AdminShelf } from '../../../shared/dto/admin-shelf';
import { AdminProduct } from '../../../shared/dto/admin-product';
import { FormBuilder } from '@angular/forms';
import { pairwise } from 'rxjs';
import { LoggerService } from '../../../shared/service/logger.service';

@Component({
  selector: 'app-admin-shelf-management',
  templateUrl: './admin-shelf-management.component.html',
  styleUrl: './admin-shelf-management.component.scss'
})
export class AdminShelfManagementComponent implements OnInit {
  selectedShelf: AdminShelf | null = null;
  searchForm = this.fb.nonNullable.group({
    searchText: [''] // Arama metni için değişken eklendi
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
     private shelfService: ShelfService,
     private toastr: ToastrService,
     private fb: FormBuilder,
     private logger: LoggerService
  ) { }

  shelves: AdminShelf[] = [];
  products: AdminProduct[] = [];
  searchShelfId: string = ''; // Arama metni için değişken eklendi

  // loadShelfEvent=new EventEmitter<void>();
  // uuidToSequenceMap: { [key: string]: number} = {};
  
  // loadShelf(){
  //   this.shelfService.getAllShelves().subscribe(
  //     (data: AdminShelf[]) => {
  //       this.shelves = data;
        
  //       // UUID'leri sıralı numaralarla eşleştirme
  //       this.uuidToSequenceMap = {}; // Önce objeyi sıfırlayın
        
  //       this.shelves.forEach((shelf, index) => {
  //         // Her ürünün id'sini sıralı numaralarla eşleştir
  //         this.uuidToSequenceMap[shelf.id] = index + 1;
  //       });
  //       console.log('Shelves:', this.shelves);
  //       console.log('uuidToSequenceMap:', this.uuidToSequenceMap);
  //     },
  //     (error) => {
  //       console.error('Error loading shelves:', error);
  //       this.toastr.error('Error loading shelves. Please try again.');
  //     }
  //   );
  //   this.loadShelfEvent.emit();
  // }

  ngOnInit(): void {
    // this.loadShelf();
    this.shelfService.getAllTableShelves().subscribe({
      next: (shelf => {
        console.log(shelf);
        this.shelves = shelf;
        this.filterShelf();
      })
    });
    this.searchForm.get("searchText")?.valueChanges.subscribe({
      next: (data) =>{
        this.filterShelf(data);
      }
    })
  }
  addShelf(){
    this.router.navigate(['addShelf'], { relativeTo: this.route });
  }

  setSelectedShelf(shelf: AdminShelf) {
    if (shelf == this.selectedShelf) {
      this.selectedShelf = null;
    } else if(shelf.productCount > 0){
      this.selectedShelf = shelf;
      this.getSelectedShelfProducts();
    }
  }
  getSelectedShelfProducts() {
    if(this.selectedShelf != null){
      this.shelfService.getAllProductsFromShelf(this.selectedShelf.id).subscribe((products)=>{
        this.products=products;
      });
    }
  }

  editShelf(shelf : AdminShelf) {
    this.shelfService.editingShelf = shelf;
    console.log(shelf);
    this.router.navigate(['editShelf'], { relativeTo: this.route });
  }
  
  deleteShelf(shelf: AdminShelf) {
    console.log(shelf.id);
    this.shelfService.deleteShelf(shelf.id).subscribe({
      next: () => {
        this.shelves = this.shelves.filter(s => s.id!== shelf.id);
        this.toastr.success("Shelf deleted successfully");
        console.log(this.shelves);
      },
      error: (err)=> {
        console.log(err);
      }
    })
  }

  filteredShelves: AdminShelf [] = [];
  filterShelf(data="") {
    this.filteredShelves= this.shelves ;
    // Arama filtresi
    if (data) {
     this.filteredShelves = this.filteredShelves.filter(shelf => {
      this.logger.log(shelf)
      return shelf.productCategory?.toLowerCase().includes(data.toLowerCase())
     }
     );
    }
  }


  }
