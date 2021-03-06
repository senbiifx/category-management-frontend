import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CategoryNode } from './category-node';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Response } from './common/response';
import { map, filter, tap } from 'rxjs/operators'
import { VoidResponse } from './common/void-response';


@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private httpClient: HttpClient) { }


  getCategories(): Observable<CategoryNode[]> {
    var url = environment.baseUrl + "/api/categories"
    var response = this.httpClient.get<Response<CategoryNode[]>>(url)
    return response.pipe(map(r => r.data))
  }

  deleteCategory(categoryId: number){
    var url = environment.baseUrl + "/api/categories/" + categoryId
    var response = this.httpClient.delete<Response<VoidResponse>>(url)
    return response.pipe(map(r => r.data))
  }

  updateCategory(category: CategoryNode){
    var url = environment.baseUrl + "/api/categories/" + category.categoryId
    var response = this.httpClient.patch<Response<VoidResponse>>(url, category)
    return response.pipe(map(r => r.data))
  }

  addCategory(category: CategoryNode){
    var url = environment.baseUrl + "/api/categories"
    var response = this.httpClient.post<Response<CategoryNode>>(url, category)
    return response.pipe(map(r => r.data))
  }
}
