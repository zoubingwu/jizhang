import { createSelector } from 'reselect';
import { debug } from '../utils';
import { BILL_TYPE, SORTING_METHOD } from './constants';

const d = debug('selectors');

export const billsSelector = (state) => state.bills;
export const billsTreeSelector = (state) => state.billsTree;
export const currentDateSelector = (state) => state.currentDate;
export const categoriesSelector = (state) => state.categories;
export const currentCategorySelector = (state) => state.currentCategory;
export const currentSortingSelector = (state) => state.curreentSorting;

export const minYearSelector = createSelector(billsTreeSelector, (tree) => {
  const years = Object.keys(tree).sort((a, b) => parseInt(a) - parseInt(b));

  if (years.length === 0) {
    return;
  }

  return parseInt(years[0]);
});

export const billsByMonthSelector = createSelector(
  [
    billsTreeSelector,
    billsSelector,
    currentDateSelector,
    currentCategorySelector,
    currentSortingSelector,
  ],
  (tree, bills, date, category, sorting) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const billsGroupByType = tree?.[year]?.[month];
    if (billsGroupByType) {
      return Object.values(billsGroupByType)
        .flat()
        .map((id) => bills[id])
        .filter((b) => {
          if (category) {
            return b.category === category;
          }
          return true;
        })
        .sort((a, b) => {
          if (sorting === SORTING_METHOD.TIME_DESC) {
            return Number(b.time) - Number(a.time);
          } else if (sorting === SORTING_METHOD.TIME_ASC) {
            return Number(a.time) - Number(b.time);
          } else if (sorting === SORTING_METHOD.AMOUNT_DESC) {
            return Number(b.amount) - Number(a.amount);
          } else if (sorting === SORTING_METHOD.AMOUNT_ASC) {
            return Number(a.amount) - Number(b.amount);
          }
        });
    }
    return [];
  }
);

export const totalExpenseByMonthSelector = createSelector(
  [billsTreeSelector, billsSelector, currentDateSelector],
  (tree, bills, date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const expenses = tree?.[year]?.[month]?.[BILL_TYPE.EXPENSE];
    if (!expenses) return 0;
    return expenses
      .map((id) => bills[id])
      .reduce((a, b) => a + parseInt(b.amount), 0);
  }
);

export const totalIncomeByMonthSelector = createSelector(
  [billsTreeSelector, billsSelector, currentDateSelector],
  (tree, bills, date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const incomes = tree?.[year]?.[month]?.[BILL_TYPE.INCOME];
    if (!incomes) return 0;
    return incomes
      .map((id) => bills[id])
      .reduce((a, b) => a + parseInt(b.amount), 0);
  }
);
