export type Category = {
	id: number;
	name: string;
};

export type ProductSpecification = {
	id: number;
	specification_name: string;
	specification_value: string;
};

export type Product = {
	id: number;
	name: string;
	asin: string | null;
	brand: string | null;
	category: Category | null;
	specifications: ProductSpecification[];
};
