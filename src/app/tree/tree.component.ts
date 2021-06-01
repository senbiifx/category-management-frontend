import { Component, OnInit } from '@angular/core';
import {MatTreeNestedDataSource} from '@angular/material/tree';
import {NestedTreeControl} from '@angular/cdk/tree';
import { CategoryNode } from '../category-node';
import { CategoryService } from '../category.service';
import { VoidResponse } from '../common/void-response';
import { MatDialog } from '@angular/material/dialog';
import { CategoryDialogComponent } from '../category-dialog/category-dialog.component';


@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.css']
})
export class TreeComponent implements OnInit {

  treeControl = new NestedTreeControl<CategoryNode>(node => node.children)
  dataSource = new MatTreeNestedDataSource<CategoryNode>()

  constructor(private categoryService: CategoryService, public dialog: MatDialog) {
    categoryService
        .getCategories()
        .subscribe(data => {
          this.dataSource.data = data
          this.treeControl.dataNodes = data
        })
        this.treeControl.expandAll
   }

  ngOnInit(): void {
  }

  deleteNode(node: CategoryNode){
    console.log('deleting node...')
    this.categoryService
        .deleteCategory(node.categoryId!!)
        .subscribe(this.onSuccessfulDeletion(node))
  }

  onSuccessfulDeletion(node: CategoryNode){
    return (response: VoidResponse) => {
      var nodes = this.dataSource.data
      if(nodes.includes(node)){
        nodes = nodes.filter(i => i != node)
        this.dataSource.data = nodes
      }else{
        var parent = this.searchParent(node)
        if(parent!=null){
          parent.children = parent.children.filter(i => i != node)
          this.refreshTreeData()
        }
      }
    }
  }

  searchParent(node: CategoryNode){
    var tree = this.dataSource.data
    var queue : CategoryNode[] = []
    tree.forEach(i => queue.push(i))
    while(queue.length > 0){
      var category = queue.pop()!!
      if(category.categoryId == node.parentId){
        return category;
      }else{
        category.children.forEach(i => queue.push(i))
      }
    }
    return null
  }

  refreshTreeData(){
    const data = this.dataSource.data
    this.dataSource.data = []
    this.dataSource.data = data
  }

  updateDialog(node: CategoryNode): void {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '250px',
      data: {name: node.name}
    });

    dialogRef.afterClosed().subscribe(result => {
        this.updateCategory(node, result)
    });
  }

  updateCategory(node: CategoryNode, result: any){
    if(result != undefined){
      var requestObject: CategoryNode = {
        categoryId : node.categoryId,
        parentId : node.parentId,
        name : result,
        children : []
      }

      this.categoryService
          .updateCategory(requestObject)
          .subscribe(response => node.name = result)
      
    }
  }

  addRootDialog(){
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '250px',
      data: {name: ''}
    });

    dialogRef.afterClosed().subscribe(result => {
        this.addRootCategory(result)
    });
  }

  addChildDialog(node: CategoryNode){
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '250px',
      data: {name: ''}
    });

    dialogRef.afterClosed().subscribe(result => {
        this.addChildCategory(node, result)
    });
  }

  addChildCategory(node: CategoryNode, result: any){
    if(result != undefined){
      var requestObject: CategoryNode = {
        categoryId : null,
        parentId : node.categoryId,
        name : result,
        children : []
      }

      this.categoryService
          .addCategory(requestObject)
          .subscribe(response => {
            if(response.children == null){
              response.children = []
            }
            node.children.push(response)
            this.refreshTreeData()
            this.treeControl.expand(node)
          })
    }
  }

  addRootCategory(result: any){
    if(result != undefined){
      var requestObject: CategoryNode = {
        categoryId : null,
        parentId : null,
        name : result,
        children : []
      }

      this.categoryService
          .addCategory(requestObject)
          .subscribe(response => {
            if(response.children == null){
              response.children = []
            }
            this.dataSource.data.push(response)
            this.refreshTreeData()
          })
    }
  }

  expandAll(){
    this.treeControl.expandAll()
  }

  collapseAll(){
    this.treeControl.collapseAll()
  }


  hasChild = (_: number, node: CategoryNode) => !!node.children && node.children.length > 0;
  
}
