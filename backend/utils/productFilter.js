class ProductFilter {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
        const keyword = this.queryStr.keyword ? {
            name: {
                $regex: this.queryStr.keyword,
                $options: 'i'
            }
        } : {};
        this.query = this.query.find({ ...keyword });
        return this;
    }

    filter() {
        const ALLOWED_FIELDS = ["price", "stock", "rating", "category", "brand", "badge"];
        const ALLOWED_OPERATORS = ["gt", "gte", "lt", "lte"];

        const queryCopy = { ...this.queryStr };
        const deleteArea = ["keyword", "page", "limit", "sort"];
        deleteArea.forEach(item => delete queryCopy[item]);

        const safeQuery = {};
        for (const field of ALLOWED_FIELDS) {
            if (!(field in queryCopy)) continue;
            const val = queryCopy[field];
            if (val !== null && typeof val === "object" && !Array.isArray(val)) {
                const safeOps = {};
                for (const op of ALLOWED_OPERATORS) {
                    if (op in val) safeOps[`$${op}`] = val[op];
                }
                if (Object.keys(safeOps).length) safeQuery[field] = safeOps;
            } else {
                safeQuery[field] = val;
            }
        }

        this.query = this.query.find(safeQuery);
        return this;
    }

    sort() {
        if (this.queryStr.sort) {
            this.query = this.query.sort(this.queryStr.sort);
        } else {
            this.query = this.query.sort("-createdAt");
        }
        return this;
    }

    pagination(resultPerPage) {
        const activePage = this.queryStr.page || 1;
        const skip = resultPerPage * (activePage - 1);
        this.query = this.query.limit(resultPerPage).skip(skip);
        return this;
    }
}

module.exports = ProductFilter;
