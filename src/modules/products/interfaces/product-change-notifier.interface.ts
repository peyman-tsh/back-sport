export interface IProductChangeNotifier {
  notify(...slugs: string[]): void;
  revalidateSlugs(...slugs: string[]): void;
}
