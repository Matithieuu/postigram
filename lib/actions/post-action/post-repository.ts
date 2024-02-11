"use server"
import {db} from "@/lib/config-db";
import {postTable} from "@/lib/schema";
import {desc} from "drizzle-orm";
import {z} from "zod";
import { PostSchema } from "@/lib/dto-post";
import { validateRequest } from "@/lib/auth";
const postArraySchema  = z.array(PostSchema);

export  async function fetchPost() {

    const data = await db.select({name:postTable.name,author:postTable.author,description:postTable.description,image:postTable.image_url,date:postTable.createdAt}).from(postTable);
    console.log(data);
    const result = postArraySchema.parse(data);
    if(result){
        return result;
    }
    else{
        throw new Error("the variable that fetch data from db is null (data)");
    }
   
    
    
}

export async function persistPost(formData: FormData) {
  const rawFormData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
  };
  const { user } = await validateRequest();
  if(user){
    await db.insert(postTable).values({author:user.username,name:rawFormData.title,description:rawFormData.description});
  }
  else{
    throw new Error("veuillez vous connecter")
  }
  // Traitement supplémentaire avec les données du formulaire
  console.log(rawFormData);
}




export async function pagination(itemPerPage:number, pageNumber:number) {
    if(itemPerPage < 0) {
        throw new Error("itemPerPage can't be negative value");
    }
    const begin = (pageNumber - 1) * itemPerPage;
    const end =  pageNumber * itemPerPage;
    const result =  await db.select().from(postTable).orderBy(desc(postTable.createdAt))
                        .limit(end)
                        .offset(begin);


    return result;

}