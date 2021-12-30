// Styles
import './Todo.scss';
// Components
import TodoItem from './Todo-item';
import Loading from '../Misc/Loading';
import {RootState} from '../../Store/Store';
//Dependencies
import {useSelector} from 'react-redux';
import React,{ useRef} from 'react';
import {Link,useNavigate,useLocation} from 'react-router-dom';

// Sorting algorithm
function sortList(list:any[],sortQuery:string|null,searchQuery:string|null) {
    if(sortQuery === 'dateAsc') {
        list = list.sort((itemA,itemB)=> new Date(itemA.creationDate).getTime() - new Date(itemB.creationDate).getTime())
    } else if(sortQuery === 'dateDesc') {
        list = list.sort((itemA,itemB)=> new Date(itemB.creationDate).getTime() - new Date(itemA.creationDate).getTime())
    } else if(sortQuery === 'statusPend') {
        list = list.filter(item=>item.status === 'Pending')
    } else if(sortQuery === 'statusComp') {
        list = list.filter(item=>item.status === 'Complete')
    }
    if(!!searchQuery) {
        list = list.filter(item=>item.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return list
}


const Todo:React.FC = () => {
    const todoList = useSelector<RootState,{title:string,description:string,creationDate:string,targetDate:string,status:string,_id:string}[]>(state=>state.todoSlice.todoList);
    const loading = useSelector<RootState,boolean>(state=>state.authSlice.loading);
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode)
     // Sorting by query params
    const [sortRef,searchRef] = [useRef<HTMLSelectElement>(null),useRef<HTMLInputElement>(null)];
    const [navigate,location] = [useNavigate(),useLocation()];
    const queryParams = new URLSearchParams(location.search);
    const [sortQuery,searchQuery] = [queryParams.get('sort'),queryParams.get('search')] 
    const sortedList = sortList([...todoList],sortQuery,searchQuery);
    function setSortQuery() {
        const [sortInput,searchInput] = [sortRef.current?.value,searchRef.current?.value];
        if(!!sortInput) {
            if(!!searchInput) {
                navigate(`/todo?sort=${sortInput}&search=${searchInput}`);
            } 
            else if(!!searchInput === false) {
                navigate(`/todo?sort=${sortInput}`);
            }
        } 
        else if(!!sortInput === false) {
            if(!!searchInput) {
                navigate(`/todo?search=${searchInput}`);
            } else {
                navigate(`/todo`)
            }
        }
    }
    return (
        <section className={`todo page`}>
            <div className='todo-controls'>
                <select onChange={setSortQuery} ref={sortRef} name="sort" className={`sort-todo select${isDarkMode?'-dark':''} hover${isDarkMode?'-dark':''}`}>
                    <option value="">Sort By</option>
                    <option value="dateAsc">Date Ascending</option>
                    <option value="dateDesc">Date Descending</option>
                    <option value="statusPend">Status Pending</option>
                    <option value="statusComp">Status Complete</option>
                </select>
                <input ref={searchRef} onChange={setSortQuery} type="text" id="search-todo" className={`focus input${isDarkMode?'-dark':''}`} placeholder="Search" />
                <Link to="/add-new-todo" className={`link${isDarkMode?'-dark':''} add-new-todo hover${isDarkMode?'-dark':''} button${isDarkMode?'-dark':''}`}>New To Do</Link>
            </div>
            {loading?<Loading/>:
            <div className="todo-list">
                {sortedList.map((todoItem,index)=>{
                    return (
                        <TodoItem {...todoItem} key={index}/>
                    )
                })}
                <div className='hidden'>123</div>
                <div className='hidden'>123</div>
            </div>}
        </section>
    )
}

export default Todo
