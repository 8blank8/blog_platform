import { DefaultPagination } from "../default.pagination";
import { TopUsersQueryParamModel } from "src/features/quiz/models/top.users.query.param.model";


export class TopUsersPagniation extends DefaultPagination {
    constructor(
        private queryParam: TopUsersQueryParamModel
    ) {
        super(
            queryParam.pageSize,
            queryParam.pageNumber,
        );
    }

    getTopUsersPaginationForSql() {

        const defaultPagination = this.getDefaultPagination()
        const sortDirection = this.getSortDirectionForSql()

        // class SortModel {
        //     "avgScores"?: "ASC" | "DESC"
        //     "sumScore"?: "ASC" | "DESC"
        //     "winsCount"?: "ASC" | "DESC"
        //     "lossesCount"?: "ASC" | "DESC"
        // }

        let sort: any = {}

        if (this.queryParam.sort) {
            this.queryParam.sort.forEach(item => {
                const [key, order] = item.split(' ');
                sort[`"${key}"`] = order.toUpperCase();
            })
        } else {
            sort.avgScores = "DESC",
                sort.sumScore = "ASC"
        }

        return {
            ...defaultPagination,
            ...sortDirection,
            sort: sort
        }
    }
}

